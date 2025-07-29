document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', document.body.dataset.theme);
        updateThemeIcon();
    });
    
    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (document.body.dataset.theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    updateThemeIcon();
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav ul');
    const authButtons = document.querySelector('.auth-buttons');
    
    mobileMenuBtn.addEventListener('click', () => {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        authButtons.style.display = authButtons.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Modal Handling
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const courseModal = document.getElementById('courseModal');
    const closeModals = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    
    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'flex';
    });
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
            courseModal.style.display = 'none';
        });
    });
    
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === signupModal) signupModal.style.display = 'none';
        if (e.target === courseModal) courseModal.style.display = 'none';
    });
    
    // User Authentication State
    let currentUser = null;
    
    // Form Handling
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simple validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            loginModal.style.display = 'none';
            renderAllCourses();
            renderDashboard();
            alert('Login successful!');
        } else {
            alert('Invalid email or password');
        }
    });
    
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            alert('Email already registered');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            enrolledCourses: [],
            progress: {}
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        updateAuthUI();
        signupModal.style.display = 'none';
        renderAllCourses();
        renderDashboard();
        alert('Registration successful! You are now logged in.');
    });
    
    // Update UI based on authentication state
    function updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const exploreBtn = document.querySelector('.cta-button');
        
        if (currentUser) {
            // User is logged in
            authButtons.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">${currentUser.name.charAt(0)}</div>
                    <span class="user-name">${currentUser.name}</span>
                    <button class="logout-btn">Logout</button>
                </div>
            `;
            
            exploreBtn.textContent = 'Go to Dashboard';
            exploreBtn.addEventListener('click', () => {
                document.querySelector('#dashboard').scrollIntoView({ behavior: 'smooth' });
            });
            
            // Add logout functionality
            document.querySelector('.logout-btn').addEventListener('click', logout);
        } else {
            // User is logged out
            authButtons.innerHTML = `
                <button id="loginBtn">Login</button>
                <button id="signupBtn">Sign Up</button>
            `;
            
            exploreBtn.textContent = 'Explore Courses';
            exploreBtn.addEventListener('click', () => {
                document.querySelector('#all-courses').scrollIntoView({ behavior: 'smooth' });
            });
            
            // Reattach event listeners to login/signup buttons
            document.getElementById('loginBtn').addEventListener('click', () => {
                loginModal.style.display = 'flex';
            });
            
            document.getElementById('signupBtn').addEventListener('click', () => {
                signupModal.style.display = 'flex';
            });
        }
    }
    
    // Logout function
    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        renderAllCourses();
        renderDashboard();
    }
    
    // Check for logged in user on page load
    function checkAuthState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        }
    }
    
    // Course Data - Expanded to 10 courses
    const courses = [
        {
            id: 1,
            title: 'Introduction to Web Development',
            description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
            image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '4 weeks',
            level: 'beginner',
            rating: 4.8,
            lessons: [
                { id: 1, title: 'HTML Basics', videoId: 'UB1O30fR-EE', description: 'Learn the fundamental structure of HTML documents and basic tags.' },
                { id: 2, title: 'CSS Fundamentals', videoId: 'yfoY53QXEnI', description: 'Understand how to style your HTML with CSS selectors and properties.' },
                { id: 3, title: 'JavaScript Introduction', videoId: 'W6NZfCO5SIk', description: 'Get started with JavaScript to add interactivity to your websites.' },
                { id: 4, title: 'Responsive Design', videoId: 'srvUrASNj0s', description: 'Learn how to make your websites look great on all devices.' }
            ]
        },
        {
            id: 2,
            title: 'JavaScript Advanced Concepts',
            description: 'Dive deeper into JavaScript with closures, promises, async/await and more.',
            image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '6 weeks',
            level: 'intermediate',
            rating: 4.9,
            lessons: [
                { id: 1, title: 'Closures and Scope', videoId: '1JsJx1x35c0', description: 'Understand JavaScript closures and lexical scope.' },
                { id: 2, title: 'Promises', videoId: 'DHvZLI7Db8E', description: 'Learn how to work with asynchronous code using promises.' },
                { id: 3, title: 'Async/Await', videoId: 'vn3tm0quoqE', description: 'Modern way to handle asynchronous operations in JavaScript.' }
            ]
        },
        {
            id: 3,
            title: 'React for Beginners',
            description: 'Build modern web applications with the React library.',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '5 weeks',
            level: 'beginner',
            rating: 4.7,
            lessons: [
                { id: 1, title: 'React Components', videoId: 'w7ejDZ8SWv8', description: 'Learn how to create and use React components.' },
                { id: 2, title: 'State and Props', videoId: 'M_BABse7FRo', description: 'Understand how data flows in React applications.' },
                { id: 3, title: 'Hooks Introduction', videoId: 'TNhaISOUy6Q', description: 'Modern way to use state and other React features.' }
            ]
        },
        {
            id: 4,
            title: 'Node.js Backend Development',
            description: 'Learn to build server-side applications with Node.js and Express.',
            image: 'https://images.unsplash.com/photo-1581094794329-c811329bcea2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '6 weeks',
            level: 'intermediate',
            rating: 4.6,
            lessons: [
                { id: 1, title: 'Node.js Basics', videoId: 'TlB_eWDSMt4', description: 'Introduction to Node.js runtime and core modules.' },
                { id: 2, title: 'Express Framework', videoId: 'G8uL0lFFoN0', description: 'Build web applications with the Express framework.' },
                { id: 3, title: 'RESTful APIs', videoId: 'pg19Z8LL06w', description: 'Design and implement RESTful APIs with Node.js.' }
            ]
        },
        {
            id: 5,
            title: 'Python Programming Fundamentals',
            description: 'Learn Python from scratch with hands-on exercises and projects.',
            image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '4 weeks',
            level: 'beginner',
            rating: 4.7,
            lessons: [
                { id: 1, title: 'Python Basics', videoId: 'rfscVS0vtbw', description: 'Introduction to Python syntax and basic concepts.' },
                { id: 2, title: 'Functions and Modules', videoId: '9Os0o3wzS_I', description: 'Learn to create reusable code with functions and modules.' },
                { id: 3, title: 'Working with Data', videoId: 'daefaLgNkw0', description: 'Manipulate data with lists, dictionaries and other structures.' }
            ]
        },
        {
            id: 6,
            title: 'Data Science with Python',
            description: 'Introduction to data analysis and visualization with Python.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '6 weeks',
            level: 'intermediate',
            rating: 4.8,
            lessons: [
                { id: 1, title: 'NumPy Fundamentals', videoId: 'QUT1VHiLmmI', description: 'Learn numerical computing with NumPy arrays.' },
                { id: 2, title: 'Pandas for Data Analysis', videoId: 'dcqPhpYuztU', description: 'Manipulate and analyze data with Pandas.' },
                { id: 3, title: 'Data Visualization', videoId: '3m7BgIvC-uQ', description: 'Create insightful visualizations with Matplotlib and Seaborn.' }
            ]
        },
        {
            id: 7,
            title: 'Advanced CSS and Sass',
            description: 'Master modern CSS techniques including Flexbox, Grid and Sass.',
            image: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '4 weeks',
            level: 'intermediate',
            rating: 4.5,
            lessons: [
                { id: 1, title: 'CSS Grid', videoId: '9zBsdzdE4sM', description: 'Create complex layouts with CSS Grid.' },
                { id: 2, title: 'Flexbox Deep Dive', videoId: 'JJSoEo8JSnc', description: 'Master flexible layouts with Flexbox.' },
                { id: 3, title: 'Sass Workflow', videoId: 'Zz6eOVaaelI', description: 'Improve your CSS workflow with Sass.' }
            ]
        },
        {
            id: 8,
            title: 'UX/UI Design Principles',
            description: 'Learn the fundamentals of user experience and interface design.',
            image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '5 weeks',
            level: 'beginner',
            rating: 4.6,
            lessons: [
                { id: 1, title: 'UX Fundamentals', videoId: 'Ovj4hFxko7c', description: 'Core principles of user experience design.' },
                { id: 2, title: 'UI Design Patterns', videoId: 'NHEaYbDWyQE', description: 'Common interface patterns and best practices.' },
                { id: 3, title: 'Prototyping Tools', videoId: '6qS83Uhlo6k', description: 'Create interactive prototypes with modern tools.' }
            ]
        },
        {
            id: 9,
            title: 'Machine Learning Basics',
            description: 'Introduction to machine learning algorithms and applications.',
            image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '8 weeks',
            level: 'advanced',
            rating: 4.9,
            lessons: [
                { id: 1, title: 'ML Concepts', videoId: 'ukzFI9rgwfU', description: 'Overview of machine learning concepts.' },
                { id: 2, title: 'Supervised Learning', videoId: 'cfj6yaYE86U', description: 'Regression and classification algorithms.' },
                { id: 3, title: 'Neural Networks', videoId: 'aircAruvnKk', description: 'Introduction to deep learning.' }
            ]
        },
        {
            id: 10,
            title: 'DevOps Fundamentals',
            description: 'Learn about CI/CD, containers and cloud deployment.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            duration: '6 weeks',
            level: 'intermediate',
            rating: 4.7,
            lessons: [
                { id: 1, title: 'Docker Containers', videoId: 'gAkwW2tuIqE', description: 'Package applications with Docker.' },
                { id: 2, title: 'CI/CD Pipelines', videoId: 'scEDHsr3APg', description: 'Automate testing and deployment.' },
                { id: 3, title: 'Cloud Deployment', videoId: 'M9882s9Zm1Q', description: 'Deploy applications to cloud platforms.' }
            ]
        }
    ];
    
    // Render All Courses
    function renderAllCourses() {
        const allCoursesGrid = document.querySelector('.all-courses-grid');
        
        if (!currentUser) {
            allCoursesGrid.innerHTML = `
                <div class="restricted-message">
                    <i class="fas fa-lock"></i>
                    <h3>Access to Courses Restricted</h3>
                    <p>Please login or create an account to access our full course catalog and start learning.</p>
                    <button class="cta-button" id="restrictedLoginBtn">Login</button>
                    <button class="cta-button secondary" id="restrictedSignupBtn">Sign Up</button>
                </div>
            `;
            
            document.getElementById('restrictedLoginBtn').addEventListener('click', () => {
                loginModal.style.display = 'flex';
            });
            
            document.getElementById('restrictedSignupBtn').addEventListener('click', () => {
                signupModal.style.display = 'flex';
            });
            
            return;
        }
        
        allCoursesGrid.innerHTML = '';
        
        courses.forEach(course => {
            const isEnrolled = currentUser.enrolledCourses.includes(course.id);
            const courseProgress = currentUser.progress[course.id] || 0;
            
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <div class="course-image">
                    <img src="${course.image}" alt="${course.title}">
                    ${isEnrolled ? '<div class="enrolled-badge">Enrolled</div>' : ''}
                </div>
                <div class="course-info">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <span>${course.duration} • ${course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                        <span class="rating"><i class="fas fa-star"></i> ${course.rating}</span>
                    </div>
                    <button class="enroll-btn" data-id="${course.id}">
                        ${isEnrolled ? 
                            (courseProgress > 0 ? `Continue (${courseProgress}%)` : 'Start Learning') : 
                            'Enroll Now'}
                    </button>
                </div>
            `;
            allCoursesGrid.appendChild(courseCard);
            
            // Add event listener to enroll/continue button
            courseCard.querySelector('.enroll-btn').addEventListener('click', function() {
                const courseId = parseInt(this.getAttribute('data-id'));
                handleCourseAction(courseId);
            });
        });
        
        // Add filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                const courseCards = document.querySelectorAll('.course-card');
                
                courseCards.forEach(card => {
                    const courseLevel = card.querySelector('.course-meta span').textContent.toLowerCase().split(' • ')[1];
                    if (filter === 'all' || courseLevel.includes(filter)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Handle course enrollment/access
    function handleCourseAction(courseId) {
        const course = courses.find(c => c.id === courseId);
        const isEnrolled = currentUser.enrolledCourses.includes(courseId);
        
        if (!isEnrolled) {
            // Enroll user in course
            currentUser.enrolledCourses.push(courseId);
            currentUser.progress[courseId] = 0;
            
            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            renderAllCourses();
            renderDashboard();
        }
        
        // Open course modal
        openCourseModal(course);
    }
    
    // Populate Dashboard
    const progressCircles = document.querySelector('.progress-circles');
    const continueCourses = document.querySelector('.continue-courses');
    
    function renderDashboard() {
        if (!currentUser) {
            document.querySelector('#dashboard').style.display = 'none';
            return;
        }
        
        document.querySelector('#dashboard').style.display = 'block';
        
        // Progress Summary
        const enrolledCourses = courses.filter(c => currentUser.enrolledCourses.includes(c.id));
        const totalProgress = enrolledCourses.length > 0 ? 
            enrolledCourses.reduce((sum, course) => sum + (currentUser.progress[course.id] || 0), 0) / enrolledCourses.length : 0;
        
        progressCircles.innerHTML = `
            <div class="progress-circle">
                <div class="circle" style="background: conic-gradient(var(--primary-color) 0% ${totalProgress}%, #eee ${totalProgress}% 100%)">
                    <span>${Math.round(totalProgress)}%</span>
                </div>
                <p>Overall Progress</p>
            </div>
            <div class="progress-circle">
                <div class="circle" style="background: conic-gradient(var(--secondary-color) 0% ${enrolledCourses.length / courses.length * 100}%, #eee ${enrolledCourses.length / courses.length * 100}% 100%)">
                    <span>${enrolledCourses.length}/${courses.length}</span>
                </div>
                <p>Courses Enrolled</p>
            </div>
        `;
        
        // Continue Learning
        continueCourses.innerHTML = '';
        
        if (enrolledCourses.length === 0) {
            continueCourses.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>You haven't enrolled in any courses yet.</p>
                    <button class="cta-button" id="exploreFromDashboard">Explore Courses</button>
                </div>
            `;
            
            document.getElementById('exploreFromDashboard').addEventListener('click', () => {
                document.querySelector('#all-courses').scrollIntoView({ behavior: 'smooth' });
            });
            
            return;
        }
        
        enrolledCourses.forEach(course => {
            const courseProgress = currentUser.progress[course.id] || 0;
            const completedLessons = Math.floor(course.lessons.length * (courseProgress / 100));
            
            const continueCourse = document.createElement('div');
            continueCourse.className = 'continue-course';
            continueCourse.innerHTML = `
                <img src="${course.image}" alt="${course.title}">
                <div class="continue-course-info">
                    <h4>${course.title}</h4>
                    <p>${completedLessons}/${course.lessons.length} lessons completed</p>
                    <div class="continue-progress">
                        <div class="continue-progress-fill" style="width: ${courseProgress}%"></div>
                    </div>
                </div>
            `;
            continueCourse.addEventListener('click', () => openCourseModal(course));
            continueCourses.appendChild(continueCourse);
        });
    }
    
    // Course Modal
    let currentCourse = null;
    let currentLessonIndex = 0;
    
    function openCourseModal(course) {
        if (!currentUser || !currentUser.enrolledCourses.includes(course.id)) {
            alert('Please enroll in this course first');
            return;
        }
        
        currentCourse = course;
        const userProgress = currentUser.progress[course.id] || 0;
        const completedLessons = Math.floor(course.lessons.length * (userProgress / 100));
        
        // Find first incomplete lesson or default to first lesson
        currentLessonIndex = course.lessons.findIndex((lesson, index) => 
            index >= completedLessons || !(index < completedLessons)
        );
        if (currentLessonIndex === -1) currentLessonIndex = 0;
        
        document.getElementById('courseModalTitle').textContent = course.title;
        document.getElementById('courseProgressFill').style.width = `${userProgress}%`;
        document.getElementById('courseProgressText').textContent = `${userProgress}%`;
        
        // Populate lessons list
        const lessonsList = document.getElementById('courseLessonsList');
        lessonsList.innerHTML = '';
        course.lessons.forEach((lesson, index) => {
            const li = document.createElement('li');
            li.className = `${index === currentLessonIndex ? 'active' : ''} ${index < completedLessons ? 'completed' : ''}`;
            li.textContent = lesson.title;
            li.addEventListener('click', () => {
                currentLessonIndex = index;
                updateLessonDisplay();
            });
            lessonsList.appendChild(li);
        });
        
        // Update lesson display
        updateLessonDisplay();
        
        // Show modal
        courseModal.style.display = 'flex';
    }
    
    function updateLessonDisplay() {
        const lesson = currentCourse.lessons[currentLessonIndex];
        const userProgress = currentUser.progress[currentCourse.id] || 0;
        const completedLessons = Math.floor(currentCourse.lessons.length * (userProgress / 100));
        
        // Update video
        const videoFrame = document.getElementById('courseVideoFrame');
        videoFrame.src = `https://www.youtube.com/embed/${lesson.videoId}?rel=0`;
        
        // Update description
        document.getElementById('videoDescription').textContent = lesson.description;
        
        // Update active lesson in list
        document.querySelectorAll('#courseLessonsList li').forEach((li, index) => {
            li.classList.remove('active');
            if (index === currentLessonIndex) li.classList.add('active');
        });
        
        // Update navigation buttons
        document.getElementById('prevLesson').disabled = currentLessonIndex === 0;
        document.getElementById('nextLesson').disabled = currentLessonIndex === currentCourse.lessons.length - 1;
        
        // Update complete button
        const completeBtn = document.getElementById('completeLesson');
        completeBtn.disabled = currentLessonIndex < completedLessons;
        completeBtn.textContent = currentLessonIndex < completedLessons ? 'Completed ✓' : 'Mark as Complete';
    }
    
    // Lesson Navigation
    document.getElementById('prevLesson').addEventListener('click', () => {
        if (currentLessonIndex > 0) {
            currentLessonIndex--;
            updateLessonDisplay();
        }
    });
    
    document.getElementById('nextLesson').addEventListener('click', () => {
        if (currentLessonIndex < currentCourse.lessons.length - 1) {
            currentLessonIndex++;
            updateLessonDisplay();
        }
    });
    
    // Complete Lesson
    document.getElementById('completeLesson').addEventListener('click', () => {
        const userProgress = currentUser.progress[currentCourse.id] || 0;
        const completedLessons = Math.floor(currentCourse.lessons.length * (userProgress / 100));
        
        if (currentLessonIndex >= completedLessons) {
            // Calculate new progress
            const newCompletedLessons = completedLessons + 1;
            const newProgress = Math.round((newCompletedLessons / currentCourse.lessons.length) * 100);
            
            // Update user progress
            currentUser.progress[currentCourse.id] = newProgress;
            
            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            document.querySelector(`#courseLessonsList li:nth-child(${currentLessonIndex + 1})`).classList.add('completed');
            document.getElementById('courseProgressFill').style.width = `${newProgress}%`;
            document.getElementById('courseProgressText').textContent = `${newProgress}%`;
            document.getElementById('completeLesson').textContent = 'Completed ✓';
            document.getElementById('completeLesson').disabled = true;
            
            // Move to next lesson if available
            const nextLessonIndex = currentCourse.lessons.findIndex((l, i) => i > currentLessonIndex && i >= newCompletedLessons);
            if (nextLessonIndex !== -1) {
                currentLessonIndex = nextLessonIndex;
                updateLessonDisplay();
            }
            
            // Update dashboard
            renderDashboard();
            renderAllCourses();
        }
    });
    
    // Initialize
    checkAuthState();
    renderAllCourses();
    renderDashboard();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Highlight active section while scrolling
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 100;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                document.querySelector(`nav a[href="#${sectionId}"]`).classList.add('active');
            }
        });
    });
});