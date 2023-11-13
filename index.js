// script.js

// script.js

// Load food details from JSON file
fetch('foods.json')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('foods', JSON.stringify(data));
    })
    .catch(error => console.error('Error loading foods.json:', error));


function showSignup() {
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');
    const signupTitle = document.getElementById('signupTitle');
    const notuser = document.getElementById('not-user')
    signupBtn.style.display = 'block';
    loginBtn.style.display = 'none';
    signupTitle.innerHTML = "SignUp";
    notuser.style.display = 'none';

}

let myChart; // Declare a variable to store the chart instance



// Function to check if a user is logged in
function isLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser !== null;

}

// Function for user signup
function signUp() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        displayMessage('Please enter both username and password.', false);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
        displayMessage('Username already exists. Please choose a different username.', false);
        return;
    }

    const newUser = { username, password, foods: [] };
    users.push(newUser);

    // Update local storage
    localStorage.setItem('users', JSON.stringify(users));

    // Set the current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    toggleSignupButton();
    displayMessage('Signup successful! Welcome, ' + username);
}

// Function for user login
function logIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        displayMessage('Please enter both username and password.', false);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = users.find(user => user.username === username && user.password === password);

    if (!currentUser) {
        displayMessage('Invalid username or password.', false);
        return;
    }

    // Set the current user
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    toggleSignupButton();
    displayMessage('Login successful! Welcome back, ' + username);


    // After successful login, hide the login form
    const loginForm = document.getElementById('authForm');
    const myModal = new bootstrap.Modal(document.getElementById('loginModal'))
    myModal.hide()

    if (loginForm) {
        myModal.hide()

    }


}


// Function to toggle the visibility of the signup button
function toggleSignupButton() {
    const signupBtn = document.getElementById('signupBtn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // Hide the signup button if a user is logged in
        signupBtn.style.display = 'none';
    } else {
        // Show the signup button if no user is logged in
        signupBtn.style.display = 'block';
    }
}


// Load user data and toggle signup button visibility
function loadUserData() {
    // Check if users are already present in localStorage
    const usersData = localStorage.getItem('users');

    if (!usersData) {
        // Set initial users for testing
        const initialUsers = [
            { username: 'user1', password: 'password1', foods: [] },
            { username: 'user2', password: 'password2', foods: [] },
            // Add more users if needed
        ];

        localStorage.setItem('users', JSON.stringify(initialUsers));
    }

    // Ensure that the signup button is correctly toggled
    toggleSignupButton();
    displayFoods();
}

// Call loadUserData instead of toggleSignupButton directly
loadUserData();

// Function for creating a new foods

function createFood() {
    const foodName = document.getElementById('foodName').value;
    const mealSelect = document.getElementById('mealSelect');
    const selectedMeal = mealSelect.options[mealSelect.selectedIndex].value;
    const currentDate = new Date().toLocaleDateString();

    if (!foodName) {
        displayMessage1('Please enter the food name.', false);
        return;
    }

    // Get details from local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const foods = JSON.parse(localStorage.getItem('foods'));
    const foodDetails = foods.find(food => food.name === foodName);

    if (!currentUser) {
        displayMessage1('Please Login to log your food!', false);
        return;
    }

    if (!foodDetails) {
        displayMessage1('Details for the entered food not found.', false);
        return;
    }

    // Add the food to the user's list with date, meal, and quantity
    const newFoodEntry = {
        ...foodDetails,
        date: currentDate,
        meal: selectedMeal,
        quantity: 1, // You can add a quantity input in your form if needed
    };
    currentUser.foods.push(newFoodEntry);

    // Save to local storage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update foods list and display total intake
    displayFoods();
    // displayTotalIntake();

    displayMacros(calculateTotalIntake(currentUser.foods));
    displayMessage1('Food added successfully!', true);
}




// Function for displaying foods grouped by meals
function displayFoods() {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = '';

    // Get the current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        const meals = {};

        currentUser.foods.forEach((food, index) => {
            const meal = food.meal.toLowerCase();

            if (!meals[meal]) {
                meals[meal] = [];
            }

            meals[meal].push(food);
        });

        // Display foods for each meal
        for (const meal in meals) {
            const mealHeader = document.createElement('h3');
            mealHeader.textContent = `${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
            foodList.appendChild(mealHeader);

            meals[meal].forEach((food, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${food.name} - Calories: ${food.calories}, Protein: ${food.protein}g, Fat: ${food.fat}g, Carbs: ${food.carbs}g`;


                // Add Edit button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                // Pass food details to the editFood function
                editButton.onclick = () => editFood(index, meal);
                listItem.appendChild(editButton);

                // Create a delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteFood(index, meal);
                listItem.appendChild(deleteButton);

                foodList.appendChild(listItem);
            });

            // Display total for the meal
            displayMealTotal(meals[meal], meal);
        }

        // Display overall total
        displayOverallTotal(currentUser.foods);
        displayMacros(calculateTotalIntake(currentUser.foods));
    }
}

// Function to delete a specific food entry
function deleteFood(index, meal) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mealFoods = currentUser.foods.filter(food => food.meal.toLowerCase() === meal.toLowerCase());

    // Remove the selected food entry
    mealFoods.splice(index, 1);

    // Update the user's data
    currentUser.foods = [...mealFoods, ...currentUser.foods.filter(food => food.meal.toLowerCase() !== meal.toLowerCase())];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Refresh the displayed foods
    displayFoods();
    displayMacros(calculateTotalIntake(currentUser.foods));
}


function editFood(index, meal) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mealFoods = currentUser.foods.filter(food => food.meal.toLowerCase() === meal.toLowerCase());

    // Remove the selected food entry
    mealFoods.splice(index, 1);
    displayMessage1('Please enter the food name to update.', true);
    // Update the user's data
    currentUser.foods = [...mealFoods, ...currentUser.foods.filter(food => food.meal.toLowerCase() !== meal.toLowerCase())];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Refresh the displayed foods
    displayFoods();
    displayMacros(calculateTotalIntake(currentUser.foods));
}






// Function for displaying the total for a specific meal
function displayMealTotal(mealFoods, meal) {
    const total = calculateTotalIntake(mealFoods);
    const totalItem = document.createElement('li');
    totalItem.textContent = `Total for ${meal.charAt(0).toUpperCase() + meal.slice(1)} - Calories: ${total.calories}, Protein: ${total.protein}g, Fat: ${total.fat}g, Carbs: ${total.carbs}g`;
    foodList.appendChild(totalItem);


}


// Function for displaying the overall total
function displayOverallTotal(foods) {
    const total = calculateTotalIntake(foods);
    const overallTotalItem = document.createElement('h3');
    overallTotalItem.textContent = `Total Intake for ${new Date().toLocaleDateString()}`;
    foodList.appendChild(overallTotalItem);

    const totalItem = document.createElement('li');
    totalItem.textContent = `Calories: ${total.calories} | Protein: ${total.protein}g | Fat: ${total.fat}g | Carbs: ${total.carbs}g`;
    foodList.appendChild(totalItem);
}

// Function to calculate total intake for a set of foods
function calculateTotalIntake(foods) {
    return foods.reduce((total, food) => {
        total.calories += food.calories;
        total.protein += food.protein;
        total.fat += food.fat;
        total.carbs += food.carbs;
        return total;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
}
// Initial display
displayFoods();
toggleSignupButton();





// Function to display messages in the message area
function displayMessage(message, isSuccess = true) {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = message;

    // Add a class for styling based on success or errors
    messageArea.className = isSuccess ? 'success' : 'error';

    // Clear the message after a few seconds
    setTimeout(() => {
        messageArea.innerHTML = '';
        messageArea.className = '';
    }, 3000); // Message will disappear after 3 seconds
}

// Function to display messages in the message area
function displayMessage1(message, isSuccess = true) {
    const messageArea = document.getElementById('messageArea1');
    messageArea.innerHTML = message;

    // Add a class for styling based on success or errors
    messageArea.className = isSuccess ? 'success' : 'error';

    // Clear the message after a few seconds
    setTimeout(() => {
        messageArea.innerHTML = '';
        messageArea.className = '';
    }, 3000); // Message will disappear after 3 seconds
}

// Load user data and toggle signup button visibility
loadUserData();
// Call toggleSignupButton after loading user data
toggleSignupButton();




// Function to calculate and display macros visually using Chart.js
function displayMacros(macros) {
    const ctx = document.getElementById('macrosChart').getContext('2d');

    // Check if the chart instance exists and the canvas is not already associated with a chart
    if (myChart && !ctx.canvas.chart) {
        // Destroy the existing chart
        myChart.destroy();
        myChart = null;
    }

    // Create a new chart if it doesn't exist
    if (!myChart) {
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Fat', 'Carbs'],
                datasets: [{
                    data: [macros.protein, macros.fat, macros.carbs],
                    backgroundColor: ['#4caf50', '#2196f3', '#f44336'],
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    } else {
        // Update the existing chart data
        myChart.data.datasets[0].data = [macros.protein, macros.fat, macros.carbs];
        myChart.update(); // Update the chart
    }
}




