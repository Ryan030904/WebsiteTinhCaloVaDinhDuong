// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDi1RRzsP4TtZ1R-o9Tst5UX1t1C0BI2pA",
    authDomain: "nutriplan-f335e.firebaseapp.com",
    databaseURL: "https://nutriplan-f335e-default-rtdb.firebaseio.com",
    projectId: "nutriplan-f335e",
    storageBucket: "nutriplan-f335e.firebasestorage.app",
    messagingSenderId: "594370805250",
    appId: "1:594370805250:web:4b54c8e3e88b152858b11b",
    measurementId: "G-5FT11ZN85P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check authentication state
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log('User is signed in:', user.uid);
        // Load user data when signed in
        loadUserData(user.uid);
    } else {
        console.log('No user is signed in');
        // Redirect to login if not signed in
        window.location.href = 'index.html';
    }
});

// Function to load user data
function loadUserData(userId) {
    console.log('Loading user data for:', userId);
    firebase.database().ref('users/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log('User data loaded:', userData);
                renderAccountInfo(userData);
            } else {
                console.log('No user data found');
                showErrorAlert('Lỗi!', 'Không tìm thấy thông tin người dùng');
            }
        })
        .catch((error) => {
            console.error('Error loading user data:', error);
            showErrorAlert('Lỗi!', 'Không thể tải thông tin người dùng');
        });
}

// Biến toàn cục
let currentDate = new Date();

// Hàm toàn cục
function loadMeals() {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    const dateStr = formatDateForFirebase(currentDate);
    const mealsRef = firebase.database().ref(`users/${userId}/meals/${dateStr}`);

    mealsRef.on('value', (snapshot) => {
        const mealsList = document.getElementById('mealsList');
        if (!mealsList) return;
        
        mealsList.innerHTML = '';
        let totalCalories = 0;
        let totalWater = 0;

        if (snapshot.exists()) {
            const meals = snapshot.val();
            Object.entries(meals).forEach(([mealId, meal]) => {
                const mealCard = document.createElement('div');
                mealCard.className = 'meal-card';
                mealCard.innerHTML = `
                    <div class="meal-header">
                        <span class="meal-type">${getMealTypeName(meal.type)}</span>
                        <span class="meal-time">${meal.time}</span>
                    </div>
                    <div class="meal-content">
                        <span class="meal-name">${meal.name}</span>
                        <span class="meal-calories">${meal.calories} kcal</span>
                    </div>
                    ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
                    <div class="meal-actions">
                        <button class="meal-action-btn edit" onclick="editMeal('${mealId}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="meal-action-btn delete" onclick="deleteMeal('${mealId}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                `;
                mealsList.appendChild(mealCard);

                totalCalories += meal.calories || 0;
                if (meal.type === 'water') {
                    totalWater += meal.amount || 0;
                }
            });
        }

        const totalCaloriesSpan = document.getElementById('totalCalories');
        const totalWaterSpan = document.getElementById('totalWater');
        if (totalCaloriesSpan) totalCaloriesSpan.textContent = totalCalories;
        if (totalWaterSpan) totalWaterSpan.textContent = totalWater;
    });
}

function formatDateForFirebase(date) {
    try {
        if (!date) {
            date = new Date();
        }
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        if (isNaN(date.getTime())) {
            date = new Date();
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return new Date().toISOString().split('T')[0];
    }
}

function getMealTypeName(type) {
    const types = {
        'breakfast': 'Bữa sáng',
        'lunch': 'Bữa trưa',
        'dinner': 'Bữa tối',
        'snack': 'Bữa phụ',
        'water': 'Nước uống'
    };
    return types[type] || type;
}

// Helper function to get goal text
function getGoalText(goal) {
    if (!goal) return '...';
    switch(goal) {
        case 'lose': return 'Giảm cân';
        case 'maintain': return 'Giữ cân';
        case 'gain': return 'Tăng cân';
        default: return goal;
    }
}

// Function to render account information
function renderAccountInfo(userData) {
    try {
        console.log('User Data:', userData); // Debug log

        // Basic info
        const accountAvatar = document.getElementById('accountAvatar');
        const accountName = document.getElementById('accountName');
        const accountEmail = document.getElementById('accountEmail');
        
        if (accountAvatar) accountAvatar.src = userData.photoURL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/default-avatar.png';
        if (accountName) accountName.textContent = userData.displayName || '...';
        if (accountEmail) accountEmail.textContent = userData.email || '...';
        
        // Get the latest calculation from history
        const calculationHistory = userData.calculationHistory || {};
        const latestCalculation = Object.values(calculationHistory).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        )[0] || {};

        console.log('Latest Calculation:', latestCalculation); // Debug log

        // Use the latest calculation data or fallback to current data
        const calculations = latestCalculation.calculations || userData.calculations || {};
        const basicInfo = latestCalculation.basicInfo || userData.basicInfo || {};
        const macronutrients = latestCalculation.macronutrients || userData.macronutrients || {};

        console.log('Calculations:', calculations); // Debug log
        console.log('Basic Info:', basicInfo); // Debug log

        // Update overview section
        const overviewElements = {
            'overviewGoal': getGoalText(basicInfo.goal),
            'overviewBMI': calculations.bmi ? calculations.bmi.toFixed(1) : '...',
            'overviewBMR': calculations.bmr,
            'overviewTDEE': calculations.tdee
        };

        // Update each overview element
        Object.entries(overviewElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '...';
            }
        });

        // Update health metrics section
        const healthElements = {
            'healthBMR': calculations.bmr,
            'healthTDEE': calculations.tdee,
            'healthCalorieGoal': calculations.calorieGoal,
            'healthBMI': calculations.bmi ? calculations.bmi.toFixed(1) : '...',
            'healthHeight': basicInfo.height,
            'healthWeight': basicInfo.weight
        };

        // Update each health metric element
        Object.entries(healthElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '...';
            }
        });

        // Update personal info section
        const personalElements = {
            'accountGender': basicInfo.gender === 'male' ? 'Nam' : (basicInfo.gender === 'female' ? 'Nữ' : '...'),
            'accountAge': basicInfo.age,
            'accountHeight': basicInfo.height ? `${basicInfo.height} cm` : '...',
            'accountWeight': basicInfo.weight ? `${basicInfo.weight} kg` : '...'
        };

        // Update each personal info element
        Object.entries(personalElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '...';
            }
        });

        // Update nutrition goals
        const nutritionElements = {
            'statCarbs': macronutrients.carbs,
            'statProtein': macronutrients.protein,
            'statFat': macronutrients.fat
        };

        // Update each nutrition element
        Object.entries(nutritionElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '...';
            }
        });

        // Update settings section (display email)
        const settingsEmailSpan = document.getElementById('settingsEmail');
        if (settingsEmailSpan) {
            settingsEmailSpan.textContent = userData.email || '...';
        }

    } catch (error) {
        console.error('Error in renderAccountInfo:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM SELECTORS ---
    const modal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const userDropdown = document.querySelector('.user-dropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const contactForm = document.querySelector('.contact-form');
    const googleLoginBtn = document.getElementById('googleLogin');
    const googleRegisterBtn = document.getElementById('googleRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    // Swiper/slider selectors
    const scrollLeftBtn = document.querySelector('.scroll-btn:first-child');
    const scrollRightBtn = document.querySelector('.scroll-btn:last-child');
    const recipesGrid = document.querySelector('.recipes-grid');
    const recipesSection = document.querySelector('.recipes-section');
    const recipeCards = document.querySelectorAll('.recipe-card');

    // --- COMMON FUNCTIONS ---
    function showSuccessAlert(title, text) {
        Swal.fire({ title, text, icon: 'success', timer: 1500, showConfirmButton: false });
    }
    function showErrorAlert(title, text) {
        Swal.fire({ title, text, icon: 'error' });
    }
    function showLoadingAlert(text = 'Vui lòng đợi trong giây lát') {
        Swal.fire({ title: 'Đang xử lý...', text, allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    }

    // --- HERO SLIDER ---
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.hero-nav-left');
    const nextBtn = document.querySelector('.hero-nav-right');
    let currentSlide = 0;
    let slideInterval;
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    function startSlideShow() { slideInterval = setInterval(nextSlide, 5000); }
    function stopSlideShow() { clearInterval(slideInterval); }
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => { prevSlide(); stopSlideShow(); startSlideShow(); });
        nextBtn.addEventListener('click', () => { nextSlide(); stopSlideShow(); startSlideShow(); });
    }
    if (slides.length) startSlideShow();

    // --- CONTACT FORM ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add form submission logic here
            console.log('Form submitted');
        });
    }

    // --- MODAL & DROPDOWN ---
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (firebase.auth().currentUser) {
            userDropdown.classList.toggle('show');
        } else {
            modal.classList.add('show');
        }
    });
    closeBtn.addEventListener('click', function() { modal.classList.remove('show'); });
    window.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('show'); });
    document.addEventListener('click', function(e) { if (!userDropdown.contains(e.target)) userDropdown.classList.remove('show'); });

    // --- TABS ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) content.classList.add('active');
            });
        });
    });
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById('forgotPassword').classList.add('active');
    });

    // --- AUTH FORMS ---
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (!email || !password) return showErrorAlert('Lỗi!', 'Vui lòng điền đầy đủ thông tin');
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return firebase.database().ref('users/' + user.uid).update({ lastLogin: new Date().toISOString() })
                    .then(() => {
                        showSuccessAlert('Thành công!', 'Đăng nhập thành công');
                        modal.classList.remove('show');
                        updateLoginState(user);
                    });
            })
            .catch((error) => showErrorAlert('Lỗi!', error.message));
    });
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('registerName').value;
        const terms = document.getElementById('terms').checked;
        if (!email || !password || !confirmPassword || !name) return showErrorAlert('Lỗi!', 'Vui lòng điền đầy đủ thông tin');
        if (password !== confirmPassword) return showErrorAlert('Lỗi!', 'Mật khẩu xác nhận không khớp');
        if (!terms) return showErrorAlert('Lỗi!', 'Vui lòng đồng ý với điều khoản sử dụng');
        showLoadingAlert();
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return user.updateProfile({ displayName: name }).then(() => {
                    const userData = {
                        uid: user.uid,
                        email: user.email,
                        displayName: name,
                        photoURL: user.photoURL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/default-avatar.png',
                        lastLogin: new Date().toISOString(),
                        provider: 'password',
                        createdAt: new Date().toISOString()
                    };
                    return firebase.database().ref('users/' + user.uid).set(userData)
                        .then(() => firebase.auth().signInWithEmailAndPassword(email, password));
                });
            })
            .then(() => {
                showSuccessAlert('Thành công!', 'Đăng ký và đăng nhập thành công');
                modal.classList.remove('show');
                updateLoginState(firebase.auth().currentUser);
            })
            .catch((error) => {
                let errorMessage = 'Có lỗi xảy ra khi đăng ký';
                switch (error.code) {
                    case 'auth/email-already-in-use': errorMessage = 'Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập'; break;
                    case 'auth/invalid-email': errorMessage = 'Email không hợp lệ'; break;
                    case 'auth/weak-password': errorMessage = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn'; break;
                    default: errorMessage = error.message;
                }
                showErrorAlert('Lỗi!', errorMessage);
            });
    });
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        if (!email) return showErrorAlert('Lỗi!', 'Vui lòng nhập email của bạn');
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                showSuccessAlert('Thành công!', 'Link đặt lại mật khẩu đã được gửi đến email của bạn');
                modal.classList.remove('show');
            })
            .catch((error) => showErrorAlert('Lỗi!', 'Gửi email thất bại: ' + error.message));
    });

    // --- GOOGLE AUTH ---
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    function handleGoogleAuth() {
        showLoadingAlert();
        firebase.auth().signInWithPopup(googleProvider)
            .then((result) => {
                const user = result.user;
                return firebase.database().ref('users/' + user.uid).once('value')
                    .then((snapshot) => {
                        if (!snapshot.exists()) {
                            const userData = {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                                lastLogin: new Date().toISOString(),
                                provider: 'google.com',
                                createdAt: new Date().toISOString()
                            };
                            return firebase.database().ref('users/' + user.uid).set(userData);
                        } else {
                            return firebase.database().ref('users/' + user.uid).update({ lastLogin: new Date().toISOString() });
                        }
                    })
                    .then(() => {
                        showSuccessAlert('Thành công!', 'Đăng nhập thành công');
                        modal.classList.remove('show');
                        updateLoginState(user);
                    });
            })
            .catch((error) => {
                let errorMessage = 'Có lỗi xảy ra khi đăng nhập';
                switch (error.code) {
                    case 'auth/popup-closed-by-user': errorMessage = 'Đăng nhập bị hủy. Vui lòng thử lại'; break;
                    case 'auth/popup-blocked': errorMessage = 'Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup và thử lại'; break;
                    case 'auth/cancelled-popup-request': errorMessage = 'Đăng nhập bị hủy. Vui lòng thử lại'; break;
                    default: errorMessage = error.message;
                }
                showErrorAlert('Lỗi!', errorMessage);
            });
    }
    googleLoginBtn.addEventListener('click', handleGoogleAuth);
    googleRegisterBtn.addEventListener('click', handleGoogleAuth);

    // --- UPDATE LOGIN STATE ---
    function updateLoginState(user) {
        if (user) {
            let displayName;
            const photoURL = user.photoURL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/default-avatar.png';
            if (user.providerData && user.providerData[0]) {
                const provider = user.providerData[0].providerId;
                if (provider === 'password') displayName = user.email.split('@')[0];
                else displayName = user.displayName || user.email.split('@')[0];
            } else {
                displayName = user.displayName || user.email.split('@')[0] || 'Tài khoản';
            }
            const formattedName = displayName.length > 5 ? displayName.substring(0, 5) + '...' : displayName;
            loginBtn.innerHTML = `<img src="${photoURL}" alt="Avatar" class="user-avatar"><span>${formattedName}</span>`;
            loginBtn.href = '#';
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || displayName,
                photoURL: photoURL,
                lastLogin: new Date().toISOString(),
                provider: user.providerData[0]?.providerId || 'unknown'
            };
            firebase.database().ref('users/' + user.uid).update(userData)
                .then(() => { /* console.log('User data saved successfully'); */ })
                .catch((error) => { /* console.error('Error saving user data:', error); */ });
        } else {
            loginBtn.innerHTML = 'Đăng Nhập';
            loginBtn.href = '#';
        }
    }
    firebase.auth().onAuthStateChanged(function(user) {
        updateLoginState(user);
        if (user) modal.classList.remove('show');
    });

    // --- LOGOUT ---
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
            title: 'Đăng xuất?',
            text: "Bạn có chắc chắn muốn đăng xuất?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                firebase.auth().signOut().then(() => {
                    showSuccessAlert('Đã đăng xuất!', 'Bạn đã đăng xuất thành công.');
                    userDropdown.classList.remove('show');
                }).catch(() => {
                    showErrorAlert('Lỗi!', 'Có lỗi xảy ra khi đăng xuất.');
                });
            }
        });
    });

    // --- SWIPER ---
    if (typeof Swiper !== 'undefined') {
        new Swiper('.recipes-slider', {
            slidesPerView: 3,
            spaceBetween: 24,
            loop: true,
            centeredSlides: false,
            autoplay: { delay: 3500, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                320: { slidesPerView: 1.1, spaceBetween: 10 },
                600: { slidesPerView: 1.5, spaceBetween: 16 },
                900: { slidesPerView: 2, spaceBetween: 20 },
                1200: { slidesPerView: 3, spaceBetween: 24 }
            }
        });
    }

    // --- ANIMATION ON SCROLL ---
    function isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    function handleScrollAnimation() {
        if (recipesSection && isInViewport(recipesSection)) {
            recipesSection.classList.add('visible');
            recipeCards.forEach((card, index) => {
                setTimeout(() => { card.classList.add('visible'); }, index * 200);
            });
        }
    }
    window.addEventListener('scroll', handleScrollAnimation);
    handleScrollAnimation();

    // --- SCROLL BUTTONS ---
    if (scrollLeftBtn && scrollRightBtn && recipesGrid) {
        scrollLeftBtn.addEventListener('click', () => {
            recipesGrid.scrollBy({ left: -300, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            recipesGrid.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }

    // --- HIỂN THỊ THÔNG TIN TÀI KHOẢN ---
    function renderAccountInfo(userData) {
        try {
            console.log('User Data:', userData); // Debug log

            // Basic info
            const accountAvatar = document.getElementById('accountAvatar');
            const accountName = document.getElementById('accountName');
            const accountEmail = document.getElementById('accountEmail');
            
            if (accountAvatar) accountAvatar.src = userData.photoURL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/default-avatar.png';
            if (accountName) accountName.textContent = userData.displayName || '...';
            if (accountEmail) accountEmail.textContent = userData.email || '...';
        
            // Get the latest calculation from history
            const calculationHistory = userData.calculationHistory || {};
            const latestCalculation = Object.values(calculationHistory).sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            )[0] || {};

            console.log('Latest Calculation:', latestCalculation); // Debug log

            // Use the latest calculation data or fallback to current data
            const calculations = latestCalculation.calculations || userData.calculations || {};
            const basicInfo = latestCalculation.basicInfo || userData.basicInfo || {};
            const macronutrients = latestCalculation.macronutrients || userData.macronutrients || {};

            console.log('Calculations:', calculations); // Debug log
            console.log('Basic Info:', basicInfo); // Debug log

            // Update overview section
            const overviewElements = {
                'overviewGoal': getGoalText(basicInfo.goal),
                'overviewBMI': calculations.bmi ? calculations.bmi.toFixed(1) : '...',
                'overviewBMR': calculations.bmr,
                'overviewTDEE': calculations.tdee
            };

            // Update each overview element
            Object.entries(overviewElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || '...';
                }
            });

            // Update health metrics section
            const healthElements = {
                'healthBMR': calculations.bmr,
                'healthTDEE': calculations.tdee,
                'healthCalorieGoal': calculations.calorieGoal,
                'healthBMI': calculations.bmi ? calculations.bmi.toFixed(1) : '...',
                'healthHeight': basicInfo.height,
                'healthWeight': basicInfo.weight
            };

            // Update each health metric element
            Object.entries(healthElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || '...';
                }
            });

            // Update personal info section
            const personalElements = {
                'accountGender': basicInfo.gender === 'male' ? 'Nam' : (basicInfo.gender === 'female' ? 'Nữ' : '...'),
                'accountAge': basicInfo.age,
                'accountHeight': basicInfo.height ? `${basicInfo.height} cm` : '...',
                'accountWeight': basicInfo.weight ? `${basicInfo.weight} kg` : '...'
            };

            // Update each personal info element
            Object.entries(personalElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || '...';
                }
            });

            // Update nutrition goals
            const nutritionElements = {
                'statCarbs': macronutrients.carbs,
                'statProtein': macronutrients.protein,
                'statFat': macronutrients.fat
            };

            // Update each nutrition element
            Object.entries(nutritionElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || '...';
                }
            });

            // Update settings section (display email)
            const settingsEmailSpan = document.getElementById('settingsEmail');
            if (settingsEmailSpan) {
                settingsEmailSpan.textContent = userData.email || '...';
            }

        } catch (error) {
            console.error('Error in renderAccountInfo:', error);
        }
    }

    // Add event listener for section visibility
    document.addEventListener('DOMContentLoaded', function() {
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const sections = document.querySelectorAll('.content-section');

        function showSection(sectionId) {
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                    // Trigger data refresh when section becomes visible
                    if (sectionId === 'health-metrics') {
                        const userId = firebase.auth().currentUser?.uid;
                        if (userId) {
                            firebase.database().ref('users/' + userId).once('value')
                                .then((snapshot) => {
                                    if (snapshot.exists()) {
                                        renderAccountInfo(snapshot.val());
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error fetching user data:", error);
                                    showErrorAlert('Lỗi!', 'Không thể tải thông tin người dùng');
                                });
                        }
                    }
                }
            });

            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.parentElement.classList.add('active');
            }
            });
        }

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                showSection(sectionId);
            });
        });

        // Show overview section by default
        showSection('overview');
    });

    // Lấy dữ liệu user từ Firebase khi đã đăng nhập
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref('users/' + user.uid).once('value').then(function(snapshot) {
                if (snapshot.exists()) {
                    renderAccountInfo(snapshot.val());
                }
            }).catch(function(error) {
                console.error("Error fetching user data:", error);
                showErrorAlert('Lỗi!', 'Không thể tải thông tin người dùng');
            });
        }
    });
});

// Food Diary Functionality
document.addEventListener('DOMContentLoaded', function() {
    const addMealBtn = document.getElementById('addMealBtn');
    const addMealModal = document.getElementById('addMealModal');
    const addMealForm = document.getElementById('addMealForm');
    const mealsList = document.getElementById('mealsList');
    const prevDateBtn = document.getElementById('prevDateBtn');
    const nextDateBtn = document.getElementById('nextDateBtn');
    const currentDateSpan = document.getElementById('currentDate');
    const totalCaloriesSpan = document.getElementById('totalCalories');
    const totalWaterSpan = document.getElementById('totalWater');

    let currentDate = new Date();

    // Format date for display
    function formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Ngày mai';
        } else {
            return date.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Format date for Firebase
    function formatDateForFirebase(date) {
        try {
            if (!date) {
                date = new Date();
            }
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            // Check if date is valid
            if (isNaN(date.getTime())) {
                date = new Date(); // Fallback to current date if invalid
            }
            // Format as YYYY-MM-DD to avoid special characters
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error);
            return new Date().toISOString().split('T')[0]; // Fallback to current date
        }
    }

    // Update date display
    function updateDateDisplay() {
        currentDateSpan.textContent = formatDate(currentDate);
        loadMeals();
    }

    // Định nghĩa hàm loadMeals ở phạm vi toàn cục
    function loadMeals() {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) return;

        const dateStr = formatDateForFirebase(currentDate);
        const mealsRef = firebase.database().ref(`users/${userId}/meals/${dateStr}`);

        mealsRef.on('value', (snapshot) => {
            const mealsList = document.getElementById('mealsList');
            if (!mealsList) return;
            
                mealsList.innerHTML = '';
                let totalCalories = 0;
                let totalWater = 0;

                if (snapshot.exists()) {
                    const meals = snapshot.val();
                    Object.entries(meals).forEach(([mealId, meal]) => {
                    // Tạo và thêm meal card vào DOM
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.innerHTML = `
            <div class="meal-header">
                <span class="meal-type">${getMealTypeName(meal.type)}</span>
                <span class="meal-time">${meal.time}</span>
            </div>
            <div class="meal-content">
                <span class="meal-name">${meal.name}</span>
                <span class="meal-calories">${meal.calories} kcal</span>
            </div>
            ${meal.notes ? `<div class="meal-notes">${meal.notes}</div>` : ''}
            <div class="meal-actions">
                <button class="meal-action-btn edit" onclick="editMeal('${mealId}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="meal-action-btn delete" onclick="deleteMeal('${mealId}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;
        mealsList.appendChild(mealCard);

                    // Cập nhật tổng calories
                    totalCalories += meal.calories || 0;
                    if (meal.type === 'water') {
                        totalWater += meal.amount || 0;
                    }
                });
            }

            // Cập nhật tổng calories và nước
            if (totalCaloriesSpan) totalCaloriesSpan.textContent = totalCalories;
            if (totalWaterSpan) totalWaterSpan.textContent = totalWater;
        });
    }

    // Get meal type name in Vietnamese
    function getMealTypeName(type) {
        const types = {
            'breakfast': 'Bữa sáng',
            'lunch': 'Bữa trưa',
            'dinner': 'Bữa tối',
            'snack': 'Bữa phụ',
            'water': 'Nước uống'
        };
        return types[type] || type;
    }

    // Event Listeners
    addMealBtn.addEventListener('click', () => {
        addMealModal.classList.add('show');
    });

    addMealModal.querySelector('.close').addEventListener('click', () => {
        addMealModal.classList.remove('show');
    });

    prevDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
    });

    nextDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
    });

    addMealForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showErrorAlert('Lỗi!', 'Vui lòng đăng nhập để thêm bữa ăn');
            return;
        }

        // Lấy giá trị từ form
        const mealName = document.getElementById('mealName').value;
        const mealType = document.getElementById('mealType').value;
        const mealTime = document.getElementById('mealTime').value;
        const mealCalories = parseFloat(document.getElementById('mealCalories').value) || 0;
        const mealCarbs = parseFloat(document.getElementById('mealCarbs').value) || 0;
        const mealProtein = parseFloat(document.getElementById('mealProtein').value) || 0;
        const mealFat = parseFloat(document.getElementById('mealFat').value) || 0;
        const mealNotes = document.getElementById('mealNotes').value;

        // Kiểm tra các trường bắt buộc
        if (!mealName || !mealType || !mealTime) {
            showErrorAlert('Lỗi!', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const mealData = {
            name: mealName,
            type: mealType,
            time: mealTime,
            calories: mealCalories,
            carbs: mealCarbs,
            protein: mealProtein,
            fat: mealFat,
            notes: mealNotes,
            createdAt: new Date().toISOString()
        };

        const dateStr = formatDateForFirebase(currentDate);
        const newMealRef = firebase.database().ref(`users/${currentUser.uid}/meals/${dateStr}`).push();

        newMealRef.set(mealData)
            .then(() => {
                showSuccessAlert('Thành công!', 'Đã thêm bữa ăn mới');
                addMealForm.reset();
                document.getElementById('addMealModal').classList.remove('show');
                loadMeals();
            })
            .catch((error) => {
                console.error("Error adding meal:", error);
                showErrorAlert('Lỗi!', 'Không thể thêm bữa ăn. Vui lòng thử lại.');
            });
    });

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, load meals
            updateDateDisplay();
        }
    });

    // Initialize if user is already signed in
    if (firebase.auth().currentUser) {
        updateDateDisplay();
    }
});

// Global functions for meal actions
function editMeal(mealId) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    const dateStr = formatDateForFirebase(currentDate);
    
    firebase.database().ref(`users/${userId}/meals/${dateStr}/${mealId}`).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                const meal = snapshot.val();
                
                // Điền thông tin vào form
                document.getElementById('editMealId').value = mealId;
                document.getElementById('editMealType').value = meal.type;
                document.getElementById('editMealTime').value = meal.time;
                document.getElementById('editMealName').value = meal.name;
                document.getElementById('editMealCalories').value = meal.calories || 0;
                document.getElementById('editMealCarbs').value = meal.carbs || 0;
                document.getElementById('editMealProtein').value = meal.protein || 0;
                document.getElementById('editMealFat').value = meal.fat || 0;
                document.getElementById('editMealNotes').value = meal.notes || '';

                // Hiển thị modal
                document.getElementById('editMealModal').classList.add('show');
            }
        })
        .catch((error) => {
            console.error("Error loading meal:", error);
            showErrorAlert('Lỗi!', 'Không thể tải thông tin bữa ăn');
        });
}

// Add event listeners for edit meal modal
document.addEventListener('DOMContentLoaded', function() {
    const editMealModal = document.getElementById('editMealModal');
    const editMealForm = document.getElementById('editMealForm');
    const saveEditMealBtn = document.getElementById('saveEditMealBtn');

    editMealModal.querySelector('.close').addEventListener('click', () => {
        editMealModal.classList.remove('show');
    });

    saveEditMealBtn.addEventListener('click', () => {
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) return;

        const mealId = document.getElementById('editMealId').value;
        const dateStr = formatDateForFirebase(currentDate);

        const mealData = {
            type: document.getElementById('editMealType').value,
            time: document.getElementById('editMealTime').value,
            name: document.getElementById('editMealName').value,
            calories: parseFloat(document.getElementById('editMealCalories').value) || 0,
            carbs: parseFloat(document.getElementById('editMealCarbs').value) || 0,
            protein: parseFloat(document.getElementById('editMealProtein').value) || 0,
            fat: parseFloat(document.getElementById('editMealFat').value) || 0,
            notes: document.getElementById('editMealNotes').value,
            updatedAt: new Date().toISOString()
        };

        firebase.database().ref(`users/${userId}/meals/${dateStr}/${mealId}`).update(mealData)
            .then(() => {
                showSuccessAlert('Thành công!', 'Đã cập nhật bữa ăn');
                document.getElementById('editMealModal').classList.remove('show');
                loadMeals(); // Reload the meals list
            })
            .catch((error) => {
                console.error("Error updating meal:", error);
                showErrorAlert('Lỗi!', 'Không thể cập nhật bữa ăn');
            });
    });

    // Add event listener for edit calculate calories button
    document.getElementById('editCalculateCaloriesBtn').addEventListener('click', async function() {
        const mealName = document.getElementById('editMealName').value;
        if (!mealName) {
            showErrorAlert('Lỗi!', 'Vui lòng nhập tên món ăn');
            return;
        }

        // Add loading state
        this.classList.add('loading');
        this.disabled = true;

        try {
            const prompt = `Phân tích dinh dưỡng cho món ăn: ${mealName}. Trả về kết quả theo format JSON như sau:
            {
                "calories": số calories,
                "carbs": số gram tinh bột,
                "protein": số gram đạm,
                "fat": số gram chất béo,
                "recommendations": [
                    "khuyến nghị 1 bằng tiếng Việt",
                    "khuyến nghị 2 bằng tiếng Việt",
                    ...
                ]
            }`;
            
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 3f5f1f417c3e744921ba17806eb516357061e5f70a2f691e93ff8225c0da7a83',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    messages: [
                        {
                            role: 'system',
                            content: 'Bạn là một chuyên gia dinh dưỡng người Việt Nam, hãy phân tích dinh dưỡng cho món ăn và đưa ra khuyến nghị phù hợp bằng tiếng Việt. Trả về kết quả theo format JSON.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.choices[0].message.content);

            // Hàm xử lý giá trị khoảng
            function parseRangeValue(value) {
                if (typeof value === 'number') return value;
                if (typeof value === 'string') {
                    // Nếu là khoảng giá trị (ví dụ: "350-450")
                    if (value.includes('-')) {
                        const [min, max] = value.split('-').map(v => parseFloat(v.trim()));
                        if (!isNaN(min) && !isNaN(max)) {
                            return (min + max) / 2;
                        }
                    }
                    // Nếu là số đơn
                    const num = parseFloat(value);
                    if (!isNaN(num)) return num;
                }
                return 0;
            }

            // Cập nhật các trường trong form với giá trị đã xử lý
            document.getElementById('editMealCalories').value = parseRangeValue(result.calories);
            document.getElementById('editMealCarbs').value = parseRangeValue(result.carbs);
            document.getElementById('editMealProtein').value = parseRangeValue(result.protein);
            document.getElementById('editMealFat').value = parseRangeValue(result.fat);

            // Update recommendations
            const recommendationsContent = document.getElementById('editHealthRecommendations');
            recommendationsContent.innerHTML = result.recommendations.map(rec => 
                `<p>• ${rec}</p>`
            ).join('');

        } catch (error) {
            console.error('Error analyzing nutrition:', error);
            showErrorAlert('Lỗi!', 'Không thể phân tích dinh dưỡng cho món ăn này');
        } finally {
            // Remove loading state
            this.classList.remove('loading');
            this.disabled = false;
        }
    });
});

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
                // Trigger data refresh when section becomes visible
                if (sectionId === 'health-metrics') {
                    const userId = firebase.auth().currentUser?.uid;
                    if (userId) {
                        firebase.database().ref('users/' + userId).once('value')
                            .then((snapshot) => {
                                if (snapshot.exists()) {
                                    renderAccountInfo(snapshot.val());
                                }
                            });
                    }
                }
            }
        });

        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.parentElement.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Show overview section by default
    showSection('overview');
});

// Thêm event listener cho nút tính toán calories
document.addEventListener('DOMContentLoaded', function() {
    const calculateCaloriesBtn = document.getElementById('calculateCaloriesBtn');
    if (calculateCaloriesBtn) {
    calculateCaloriesBtn.addEventListener('click', async function() {
            const mealName = document.getElementById('mealName').value.trim();
        if (!mealName) {
            showErrorAlert('Lỗi!', 'Vui lòng nhập tên món ăn');
            return;
        }

            // Hiển thị trạng thái loading
            this.classList.add('loading');
            this.disabled = true;

        try {
            const prompt = `Phân tích dinh dưỡng cho món ăn: ${mealName}. 
            Trả về kết quả theo format JSON sau, với các khuyến nghị bằng tiếng Việt:
            {
                "calories": số calo,
                "carbs": số gram tinh bột,
                "protein": số gram đạm,
                "fat": số gram chất béo,
                "recommendations": [
                    "khuyến nghị 1 bằng tiếng Việt",
                    "khuyến nghị 2 bằng tiếng Việt",
                    ...
                ]
            }`;
            
            const response = await fetch('https://api.together.xyz/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer 3f5f1f417c3e744921ba17806eb516357061e5f70a2f691e93ff8225c0da7a83',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                    messages: [
                        {
                            role: 'system',
                                content: 'Bạn là một chuyên gia dinh dưỡng người Việt Nam. Hãy phân tích dinh dưỡng cho món ăn và đưa ra khuyến nghị phù hợp bằng tiếng Việt. Các khuyến nghị nên bao gồm: lượng calo phù hợp, cách chế biến tốt cho sức khỏe, và lời khuyên về việc kết hợp với các món ăn khác.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }

            const result = JSON.parse(data.choices[0].message.content.trim());
            
                // Hàm xử lý giá trị khoảng
                function parseRangeValue(value) {
                    if (typeof value === 'number') return value;
                    if (typeof value === 'string') {
                        // Nếu là khoảng giá trị (ví dụ: "350-450")
                        if (value.includes('-')) {
                            const [min, max] = value.split('-').map(v => parseFloat(v.trim()));
                            if (!isNaN(min) && !isNaN(max)) {
                                return (min + max) / 2;
                            }
                        }
                        // Nếu là số đơn
                        const num = parseFloat(value);
                        if (!isNaN(num)) return num;
                    }
                    return 0;
                }

                // Cập nhật các trường trong form với giá trị đã xử lý
                document.getElementById('mealCalories').value = parseRangeValue(result.calories);
                document.getElementById('mealCarbs').value = parseRangeValue(result.carbs);
                document.getElementById('mealProtein').value = parseRangeValue(result.protein);
                document.getElementById('mealFat').value = parseRangeValue(result.fat);

                // Hiển thị khuyến nghị sức khỏe
                const healthRecommendations = document.getElementById('healthRecommendations');
                if (healthRecommendations) {
                    healthRecommendations.innerHTML = result.recommendations.map(rec => 
                        `<div class="recommendation-item">${rec}</div>`
                    ).join('');
                }

            showSuccessAlert('Thành công!', 'Đã phân tích dinh dưỡng cho món ăn');
        } catch (error) {
            console.error('Error analyzing nutrition:', error);
            showErrorAlert('Lỗi!', 'Không thể phân tích dinh dưỡng cho món ăn này');
        } finally {
                // Xóa trạng thái loading
                this.classList.remove('loading');
                this.disabled = false;
            }
            });
    }
});

// Thêm các hàm helper
function formatDateForFirebase(date) {
    try {
        if (!date) {
            date = new Date();
        }
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        // Check if date is valid
        if (isNaN(date.getTime())) {
            date = new Date(); // Fallback to current date if invalid
        }
        // Format as YYYY-MM-DD to avoid special characters
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return new Date().toISOString().split('T')[0]; // Fallback to current date
    }
}

function showSuccessAlert(title, message) {
    Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

function showErrorAlert(title, message) {
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

// Hàm sửa bữa ăn
function saveEditMeal() {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    const mealId = document.getElementById('editMealId').value;
    const dateStr = formatDateForFirebase(currentDate);

    // Lấy giá trị từ form
    const mealData = {
        type: document.getElementById('editMealType').value,
        time: document.getElementById('editMealTime').value,
        name: document.getElementById('editMealName').value,
        calories: parseFloat(document.getElementById('editMealCalories').value) || 0,
        carbs: parseFloat(document.getElementById('editMealCarbs').value) || 0,
        protein: parseFloat(document.getElementById('editMealProtein').value) || 0,
        fat: parseFloat(document.getElementById('editMealFat').value) || 0,
        notes: document.getElementById('editMealNotes').value,
        updatedAt: new Date().toISOString()
    };

    // Kiểm tra các trường bắt buộc
    if (!mealData.name || !mealData.type || !mealData.time) {
        showErrorAlert('Lỗi!', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    firebase.database().ref(`users/${userId}/meals/${dateStr}/${mealId}`).update(mealData)
        .then(() => {
            showSuccessAlert('Thành công!', 'Đã cập nhật bữa ăn');
            document.getElementById('editMealModal').classList.remove('show');
            loadMeals();
        })
        .catch((error) => {
            console.error("Error updating meal:", error);
            showErrorAlert('Lỗi!', 'Không thể cập nhật bữa ăn');
    });
}

// Hàm xóa bữa ăn
function deleteMeal(mealId) {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn có chắc chắn muốn xóa bữa ăn này?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            const dateStr = formatDateForFirebase(currentDate);
            const mealRef = firebase.database().ref(`users/${userId}/meals/${dateStr}/${mealId}`);
            
            mealRef.remove()
                .then(() => {
                    showSuccessAlert('Thành công!', 'Đã xóa bữa ăn');
                    loadMeals();
                })
                .catch((error) => {
                    console.error("Error deleting meal:", error);
                    showErrorAlert('Lỗi!', 'Không thể xóa bữa ăn');
                });
        }
    });
}

// Thêm event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Form thêm bữa ăn
    const addMealForm = document.getElementById('addMealForm');
    if (addMealForm) {
        // Xóa tất cả event listener cũ
        const newForm = addMealForm.cloneNode(true);
        addMealForm.parentNode.replaceChild(newForm, addMealForm);

        // Thêm event listener mới cho form
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                showErrorAlert('Lỗi!', 'Vui lòng đăng nhập để thêm bữa ăn');
                return;
            }

            // Lấy giá trị từ form
            const mealName = document.getElementById('mealName').value;
            const mealType = document.getElementById('mealType').value;
            const mealTime = document.getElementById('mealTime').value;
            const mealCalories = parseFloat(document.getElementById('mealCalories').value) || 0;
            const mealCarbs = parseFloat(document.getElementById('mealCarbs').value) || 0;
            const mealProtein = parseFloat(document.getElementById('mealProtein').value) || 0;
            const mealFat = parseFloat(document.getElementById('mealFat').value) || 0;
            const mealNotes = document.getElementById('mealNotes').value;

            // Kiểm tra các trường bắt buộc
            if (!mealName || !mealType || !mealTime) {
                showErrorAlert('Lỗi!', 'Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            const mealData = {
                name: mealName,
                type: mealType,
                time: mealTime,
                calories: mealCalories,
                carbs: mealCarbs,
                protein: mealProtein,
                fat: mealFat,
                notes: mealNotes,
                createdAt: new Date().toISOString()
            };

            const dateStr = formatDateForFirebase(currentDate);
            const newMealRef = firebase.database().ref(`users/${currentUser.uid}/meals/${dateStr}`).push();

            newMealRef.set(mealData)
                .then(() => {
                    showSuccessAlert('Thành công!', 'Đã thêm bữa ăn mới');
                    newForm.reset();
                    document.getElementById('addMealModal').classList.remove('show');
                    loadMeals();
                })
                .catch((error) => {
                    console.error("Error adding meal:", error);
                    showErrorAlert('Lỗi!', 'Không thể thêm bữa ăn. Vui lòng thử lại.');
                });
        });

        // Thêm lại event listener cho nút phân tích dinh dưỡng
        const calculateCaloriesBtn = document.getElementById('calculateCaloriesBtn');
        if (calculateCaloriesBtn) {
            calculateCaloriesBtn.addEventListener('click', async function() {
                const mealName = document.getElementById('mealName').value.trim();
                if (!mealName) {
                    showErrorAlert('Lỗi!', 'Vui lòng nhập tên món ăn');
                    return;
                }

                // Hiển thị trạng thái loading
                this.classList.add('loading');
                this.disabled = true;

                try {
                    const prompt = `Phân tích dinh dưỡng cho món ăn: ${mealName}. 
                    Trả về kết quả theo format JSON sau, với các khuyến nghị bằng tiếng Việt:
                    {
                        "calories": số calo,
                        "carbs": số gram tinh bột,
                        "protein": số gram đạm,
                        "fat": số gram chất béo,
                        "recommendations": [
                            "khuyến nghị 1 bằng tiếng Việt",
                            "khuyến nghị 2 bằng tiếng Việt",
                            ...
                        ]
                    }`;
                    
                    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer 3f5f1f417c3e744921ba17806eb516357061e5f70a2f691e93ff8225c0da7a83',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'Bạn là một chuyên gia dinh dưỡng người Việt Nam. Hãy phân tích dinh dưỡng cho món ăn và đưa ra khuyến nghị phù hợp bằng tiếng Việt. Các khuyến nghị nên bao gồm: lượng calo phù hợp, cách chế biến tốt cho sức khỏe, và lời khuyên về việc kết hợp với các món ăn khác.'
                                },
                                {
                                    role: 'user',
                                    content: prompt
                                }
                            ],
                            temperature: 0.7,
                            max_tokens: 500
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API request failed with status ${response.status}`);
                    }

                    const data = await response.json();
                    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                        throw new Error('Invalid response format from API');
                    }

                    const result = JSON.parse(data.choices[0].message.content.trim());
                    
                    // Hàm xử lý giá trị khoảng
                    function parseRangeValue(value) {
                        if (typeof value === 'number') return value;
                        if (typeof value === 'string') {
                            // Nếu là khoảng giá trị (ví dụ: "350-450")
                            if (value.includes('-')) {
                                const [min, max] = value.split('-').map(v => parseFloat(v.trim()));
                                if (!isNaN(min) && !isNaN(max)) {
                                    return (min + max) / 2;
                                }
                            }
                            // Nếu là số đơn
                            const num = parseFloat(value);
                            if (!isNaN(num)) return num;
                        }
                        return 0;
                    }

                    // Cập nhật các trường trong form với giá trị đã xử lý
                    document.getElementById('mealCalories').value = parseRangeValue(result.calories);
                    document.getElementById('mealCarbs').value = parseRangeValue(result.carbs);
                    document.getElementById('mealProtein').value = parseRangeValue(result.protein);
                    document.getElementById('mealFat').value = parseRangeValue(result.fat);

                    // Hiển thị khuyến nghị sức khỏe
                    const healthRecommendations = document.getElementById('healthRecommendations');
                    if (healthRecommendations) {
                        healthRecommendations.innerHTML = result.recommendations.map(rec => 
                            `<div class="recommendation-item">${rec}</div>`
                        ).join('');
                    }

                    showSuccessAlert('Thành công!', 'Đã phân tích dinh dưỡng cho món ăn');
                } catch (error) {
                    console.error('Error analyzing nutrition:', error);
                    showErrorAlert('Lỗi!', 'Không thể phân tích dinh dưỡng cho món ăn này');
                } finally {
                    // Xóa trạng thái loading
                    this.classList.remove('loading');
                    this.disabled = false;
                }
            });
        }
    }

    // Form sửa bữa ăn
    const saveEditMealBtn = document.getElementById('saveEditMealBtn');
    if (saveEditMealBtn) {
        saveEditMealBtn.addEventListener('click', saveEditMeal);
    }

    // Tải danh sách bữa ăn khi trang được tải
    if (firebase.auth().currentUser) {
    loadMeals();
    }
});

// Add functionality for editing personal information
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Setting up personal info edit functionality');
    
    const editPersonalInfoBtn = document.querySelector('#personal-info .edit-btn');
    const editPersonalInfoModal = document.getElementById('editPersonalInfoModal');
    const editPersonalInfoForm = document.getElementById('editPersonalInfoForm');
    const savePersonalInfoBtn = document.getElementById('savePersonalInfoBtn');

    console.log('Elements found:', {
        editBtn: !!editPersonalInfoBtn,
        modal: !!editPersonalInfoModal,
        form: !!editPersonalInfoForm,
        saveBtn: !!savePersonalInfoBtn
    });

    // Open modal and populate form
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', function() {
            console.log('Edit button clicked');
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.log('No user logged in');
                showErrorAlert('Lỗi!', 'Vui lòng đăng nhập để chỉnh sửa thông tin');
                return;
            }

            console.log('Fetching user data for:', currentUser.uid);
            firebase.database().ref('users/' + currentUser.uid).once('value')
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        console.log('User data retrieved:', userData);
                        const basicInfo = userData.basicInfo || {};

                        // Populate form with existing data
                        const genderSelect = document.getElementById('editGender');
                        const ageInput = document.getElementById('editAge');
                        const heightInput = document.getElementById('editHeight');
                        const weightInput = document.getElementById('editWeight');

                        if (genderSelect) genderSelect.value = basicInfo.gender || '';
                        if (ageInput) ageInput.value = basicInfo.age || '';
                        if (heightInput) heightInput.value = basicInfo.height || '';
                        if (weightInput) weightInput.value = basicInfo.weight || '';

                        // Show modal
                        if (editPersonalInfoModal) {
                            editPersonalInfoModal.classList.add('show');
                            console.log('Modal shown with populated data');
                        } else {
                            console.error('Modal element not found');
                        }
                    } else {
                        console.log('No user data found');
                        showErrorAlert('Lỗi!', 'Không tìm thấy thông tin người dùng');
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                    showErrorAlert('Lỗi!', 'Không thể tải thông tin người dùng để chỉnh sửa');
                });
        });
    }

    // Close modal
    if (editPersonalInfoModal) {
        const closeBtn = editPersonalInfoModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                console.log('Close button clicked');
                editPersonalInfoModal.classList.remove('show');
            });
        }

        // Close modal when clicking outside
        editPersonalInfoModal.addEventListener('click', function(e) {
            if (e.target === editPersonalInfoModal) {
                editPersonalInfoModal.classList.remove('show');
            }
        });
    }

    // Save changes
    if (savePersonalInfoBtn) {
        savePersonalInfoBtn.addEventListener('click', function() {
            console.log('Save button clicked');
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.log('No user logged in');
                showErrorAlert('Lỗi!', 'Vui lòng đăng nhập để lưu thay đổi');
                return;
            }

            // Get form values
            const genderSelect = document.getElementById('editGender');
            const ageInput = document.getElementById('editAge');
            const heightInput = document.getElementById('editHeight');
            const weightInput = document.getElementById('editWeight');

            if (!genderSelect || !ageInput || !heightInput || !weightInput) {
                console.error('Form elements not found');
                showErrorAlert('Lỗi!', 'Không thể tìm thấy các trường thông tin');
                return;
            }

            const basicInfo = {
                gender: genderSelect.value,
                age: parseInt(ageInput.value) || 0,
                height: parseFloat(heightInput.value) || 0,
                weight: parseFloat(weightInput.value) || 0,
            };

            console.log('Form values:', basicInfo);

            // Validate input
            if (!basicInfo.gender) {
                showErrorAlert('Lỗi!', 'Vui lòng chọn giới tính');
                return;
            }
            if (basicInfo.age <= 0) {
                showErrorAlert('Lỗi!', 'Tuổi phải lớn hơn 0');
                return;
            }
            if (basicInfo.height <= 0) {
                showErrorAlert('Lỗi!', 'Chiều cao phải lớn hơn 0');
                return;
            }
            if (basicInfo.weight <= 0) {
                showErrorAlert('Lỗi!', 'Cân nặng phải lớn hơn 0');
                return;
            }

            // Get existing user data
            console.log('Fetching existing user data');
            firebase.database().ref('users/' + currentUser.uid).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val() || {};
                    console.log('Existing user data:', userData);
                    const activityLevel = userData.basicInfo?.activityLevel || 'moderate';

                    // Calculate new metrics
                    const heightCm = basicInfo.height;
                    const weightKg = basicInfo.weight;
                    const ageYears = basicInfo.age;
                    const gender = basicInfo.gender;

                    // Calculate BMR
                    let bmr = 0;
                    if (gender === 'male') {
                        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
                    } else if (gender === 'female') {
                        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
                    }

                    // Calculate TDEE
                    const activityFactors = {
                        'sedentary': 1.2,
                        'light': 1.375,
                        'moderate': 1.55,
                        'active': 1.725,
                        'very active': 1.9
                    };
                    const tdee = bmr * (activityFactors[activityLevel] || 1.55);

                    // Calculate BMI
                    let bmi = 0;
                    if (heightCm > 0) {
                        bmi = weightKg / ((heightCm / 100) * (heightCm / 100));
                    }

                    // Calculate calorie goal
                    let calorieGoal = tdee;
                    const goal = userData.basicInfo?.goal;
                    if (goal === 'lose') calorieGoal = tdee - 500;
                    if (goal === 'gain') calorieGoal = tdee + 500;
                    if (calorieGoal < 1200 && gender === 'female') calorieGoal = 1200;
                    if (calorieGoal < 1500 && gender === 'male') calorieGoal = 1500;

                    const calculations = {
                        bmi: bmi,
                        bmr: bmr,
                        tdee: tdee,
                        calorieGoal: calorieGoal
                    };

                    console.log('New calculations:', calculations);

                    // Update user data
                    console.log('Updating user data');
                    return firebase.database().ref('users/' + currentUser.uid).update({
                        basicInfo: basicInfo,
                        calculations: calculations
                    });
                })
                .then(() => {
                    console.log('Data updated successfully');
                    showSuccessAlert('Thành công!', 'Đã cập nhật thông tin cá nhân');
                    editPersonalInfoModal.classList.remove('show');
                    
                    // Refresh displayed info
                    const currentUser = firebase.auth().currentUser;
                    if (currentUser) {
                        console.log('Refreshing displayed info');
                        firebase.database().ref('users/' + currentUser.uid).once('value')
                            .then((snapshot) => {
                                if (snapshot.exists()) {
                                    console.log('Rendering updated info');
                                    renderAccountInfo(snapshot.val());
                                }
                            });
                    }
                })
                .catch((error) => {
                    console.error("Error updating user data:", error);
                    showErrorAlert('Lỗi!', 'Không thể cập nhật thông tin cá nhân');
                });
        });
    }
});

// Add progress chart functionality
document.addEventListener('DOMContentLoaded', function() {
    const progressChartCanvas = document.getElementById('progressChart');
    let dailyCaloriesChart = null; // Variable to hold the chart instance

    function renderProgressChart(userId) {
        const mealsRef = firebase.database().ref(`users/${userId}/meals`);

        mealsRef.once('value', (snapshot) => {
            const dailyData = {}; // { 'YYYY-MM-DD': totalCalories }

            if (snapshot.exists()) {
                const mealsByDate = snapshot.val();
                Object.entries(mealsByDate).forEach(([date, meals]) => {
                    let totalCalories = 0;
                    if (meals) {
                        Object.values(meals).forEach(meal => {
                            totalCalories += meal.calories || 0;
                        });
                    }
                    dailyData[date] = totalCalories;
                });
            }

            // Sort dates and prepare data for chart
            const sortedDates = Object.keys(dailyData).sort();
            const chartLabels = sortedDates.map(date => {
                // Format date for display (e.g., DD/MM)
                const [year, month, day] = date.split('-');
                return `${day}/${month}`;
            });
            const chartData = sortedDates.map(date => dailyData[date]);

            // Destroy existing chart if it exists
            if (dailyCaloriesChart) {
                dailyCaloriesChart.destroy();
            }

            // Render the chart
            if (progressChartCanvas) {
                const ctx = progressChartCanvas.getContext('2d');
                dailyCaloriesChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Tổng Calo Tiêu Thụ Hàng Ngày',
                            data: chartData,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Calo (kcal)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Ngày'
                                }
                            }
                        },
                         plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Biểu Đồ Lượng Calo Tiêu Thụ Hàng Ngày'
                            }
                        }
                    }
                });
                 // Hide placeholder text if chart is rendered
                const placeholder = progressChartCanvas.parentElement.querySelector('.chart-placeholder');
                if (placeholder) placeholder.style.display = 'none';
            }
             else {
                // Show placeholder text if chart cannot be rendered
                 const placeholder = document.querySelector('#progress .chart-placeholder');
                if (placeholder) placeholder.style.display = 'block';
             }
        });
    }

    // Call render function when the progress section is activated
    const progressSection = document.getElementById('progress');
    if (progressSection) {
        // Use a MutationObserver to detect when the section becomes active
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    const targetElement = mutation.target;
                    if (targetElement.classList.contains('active')) {
                        const userId = firebase.auth().currentUser?.uid;
                        if (userId) {
                            renderProgressChart(userId);
                        }
                    }
                }
            });
        });

        observer.observe(progressSection, { attributes: true });

        // Initial check in case the section is active on page load
        if (progressSection.classList.contains('active')) {
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                renderProgressChart(userId);
            }
        }
    }
});

// Add functionality for changing password
document.addEventListener('DOMContentLoaded', function() {
    // Revised selector to target the password change button more reliably
    const changePasswordBtn = document.querySelector('#settings .settings-group .settings-item button');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');

    // Open modal
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                showErrorAlert('Lỗi!', 'Vui lòng đăng nhập để đổi mật khẩu');
                return;
            }
            // Only show for email/password users
            if (currentUser.providerData && currentUser.providerData[0]?.providerId === 'password') {
                 changePasswordModal.classList.add('show');
                 // Reset form and clear previous errors/messages
                 changePasswordForm.reset();
            } else {
                 showErrorAlert('Lỗi!', 'Chức năng này chỉ dành cho tài khoản đăng nhập bằng Email và Mật khẩu.');
            }
        });
    }

    // Close modal
    if (changePasswordModal) {
        changePasswordModal.querySelector('.close').addEventListener('click', function() {
            changePasswordModal.classList.remove('show');
        });
        // Close modal when clicking outside
         window.addEventListener('click', function(e) {
             if (e.target === changePasswordModal) {
                 changePasswordModal.classList.remove('show');
             }
         });
    }

    // Handle password change form submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentUser = firebase.auth().currentUser;
            if (!currentUser || !(currentUser.providerData && currentUser.providerData[0]?.providerId === 'password')) {
                 showErrorAlert('Lỗi!', 'Bạn cần đăng nhập bằng Email và Mật khẩu để đổi mật khẩu.');
                 return;
            }

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                showErrorAlert('Lỗi!', 'Mật khẩu mới và xác nhận mật khẩu mới không khớp.');
                return;
            }

            if (newPassword.length < 6) {
                 showErrorAlert('Lỗi!', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
                 return;
            }

            showLoadingAlert('Đang đổi mật khẩu...');

            // Reauthenticate user before changing password
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );

            currentUser.reauthenticateWithCredential(credential)
                .then(() => {
                    // Password is correct, now update it
                    return currentUser.updatePassword(newPassword);
                })
                .then(() => {
                    Swal.close(); // Close loading alert
                    showSuccessAlert('Thành công!', 'Mật khẩu của bạn đã được đổi.');
                    changePasswordModal.classList.remove('show');
                })
                .catch((error) => {
                    Swal.close(); // Close loading alert
                    let errorMessage = 'Có lỗi xảy ra khi đổi mật khẩu.';
                    switch (error.code) {
                        case 'auth/invalid-credential':
                        case 'auth/wrong-password':
                             errorMessage = 'Mật khẩu hiện tại không đúng.';
                             break;
                        case 'auth/weak-password':
                             errorMessage = 'Mật khẩu mới quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.';
                             break;
                        case 'auth/requires-recent-login':
                            errorMessage = 'Vui lòng đăng nhập lại để đổi mật khẩu.';
                            break;
                        default:
                            errorMessage = error.message;
                    }
                    showErrorAlert('Lỗi!', errorMessage);
                });
        });
    }
});
