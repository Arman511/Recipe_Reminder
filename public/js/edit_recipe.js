const email = document.getElementById("email");
const password = document.getElementById("password");
const btn_sign_in = document.getElementById("btn_sign_in");
const recipe_box = document.getElementById("recipe_box");
const sign_in = document.getElementById("sign_in");
const form_select_recipe = document.getElementById("form_select_recipe");
const btn_select_recipe = document.getElementById("btn_select_recipe");

const recipe_title = document.getElementById("recipe_name");

const ingredient_name = document.getElementById("ingredient_name");
const ingredient_amount = document.getElementById("ingredient_amount");
const ingredient_list = document.getElementById("ingredient_list");
const btn_add_ingredient = document.getElementById("btn_add_ingredient");
const btn_remove_ingredient = document.getElementById("btn_remove_ingredient");

const step_description = document.getElementById("step_description");
const step_list = document.getElementById("step_list");
const btn_add_step = document.getElementById("btn_add_step");
const btn_remove_step = document.getElementById("btn_remove_step");

const recipe_description = document.getElementById("recipe_description");

const star = document.getElementById("stars");
const servings = document.getElementById("servings");
const prep_time = document.getElementById("prep_time");
const cook_time = document.getElementById("cook_time");

const update_recipe_form = document.getElementById("update_recipe_form");
const delete_recipe_form = document.getElementById("delete_recipe_form");

const ingredients = [];
const steps = [];

const id = -1;

const btn_submit = document.getElementById("btn_submit");

const hashing = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
};

btn_sign_in.addEventListener("click", async () => {
    const email_val = email.value;
    const password_val = password.value;
    if (email_val === "" || password_val === "") {
        alert("Email and password are required");
        return;
    }

    const recipe_response = await fetch("/api/user_recipes_login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email_val,
            password: await hashing(password_val),
        }),
    });
    console.log(recipe_response);

    if (!recipe_response.ok) {
        alert(`An error has occurred ${recipe_response.status}`);
        console.error("There was a problem with the fetch operation");
        return;
    }

    const data = await recipe_response.json();

    if (data.length === 0) {
        alert("You have no recipes");
        return;
    }
    recipe_box.innerHTML = "";
    const recipe_input = document.createElement("select");
    data.forEach((recipe) => {
        const recipe_options = document.createElement("option");
        recipe_options.value = recipe.id;
        recipe_options.innerText = recipe.title;
        recipe_input.appendChild(recipe_options);
    });
    form_select_recipe.appendChild(recipe_input);
    recipe_box.style.display = "block";
});

btn_select_recipe.addEventListener("click", async () => {
    const recipe_id = form_select_recipe.querySelector("select").value;
    const response = await fetch("/api/recipe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeID: recipe_id }),
    });

    if (!response.ok) {
        alert(`An error has occurred ${response.status}`);
        console.error("There was a problem with the fetch operation");
        return;
    }

    const data = await response.json();
    console.log(data);

    recipe_title.value = data.title;
    ingredient_list.innerHTML = "";
    const ingredient_list_new = document.createElement("ul");
    data.ingredients.forEach((ingredient) => {
        const ingredient_item = document.createElement("li");
        ingredient_item.innerText = `${ingredient}`;
        ingredient_list_new.appendChild(ingredient_item);
    });
    ingredient_list.appendChild(ingredient_list_new);
    ingredients = data.ingredients;

    step_list.innerHTML = "";
    const step_list_new = document.createElement("ol");
    data.steps.forEach((step) => {
        const step_item = document.createElement("li");
        step_item.innerText = `${step}`;
        step_list_new.appendChild(step_item);
    });
    step_list.appendChild(step_list_new);
    steps = data.steps;

    recipe_description.value = data.description;
    star.value = data.star;
    servings.value = data.servings;
    prep_time.value = data.prep_time;
    cook_time.value = data.cook_time;
    id = data.id;

    sign_in.style.display = "none";
    update_recipe_form.style.display = "block";
});

btn_add_ingredient.addEventListener("click", () => {
    if (ingredient_name.value === "" || ingredient_amount.value === "") {
        alert("Ingredient name and amount are required");
        return;
    }

    ingredient_list.innerHTML =
        "<ul>" +
        ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("") +
        "</ul>";

    ingredient_name.value = "";
    ingredient_amount.value = "";
    ingredients.push(`${ingredient_name.value} - ${ingredient_amount.value}`);
});

btn_remove_ingredient.addEventListener("click", () => {
    if (ingredients.length === 0) {
        alert("There are no ingredients to remove");
        return;
    }

    ingredients.pop();
    ingredient_list.innerHTML =
        "<ul>" +
        ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("") +
        "</ul>";
});

btn_add_step.addEventListener("click", () => {
    if (step_description.value === "") {
        alert("Step description is required");
        return;
    }

    steps.push(step_description.value);
    step_list.innerHTML =
        "<ul>" + steps.map((step) => `<li>${step}</li>`).join("") + "</ul>";

    step_description.value = "";
});

btn_remove_step.addEventListener("click", () => {
    if (steps.length === 0) {
        alert("There are no steps to remove");
        return;
    }

    steps.pop();
    step_list.innerHTML =
        "<ul>" + steps.map((step) => `<li>${step}</li>`).join("") + "</ul>";
});

btn_submit.addEventListener("click", async () => {
    if (steps.length === 0 || ingredients.length === 0) {
        alert("At least one ingredient and step are required");
        return;
    }

    const title = recipe_title.value;
    const description = recipe_description.value;
    const servings_val = servings.value;
    const prep_time_val = prep_time.value;
    const cook_time_val = cook_time.value;
    const star_val = star.value;

    if (
        title === "" ||
        description === "" ||
        servings_val === "" ||
        prep_time_val === "" ||
        cook_time_val === "" ||
        star_val === ""
    ) {
        alert("All fields are required");
        return;
    }

    const response = await fetch("/api/recipe_update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipeID: id,
            title: title,
            description: description,
            ingredients: ingredients,
            steps: steps,
            servings: servings_val,
            prep_time: prep_time_val,
            cook_time: cook_time_val,
            star: star_val,
            email: email.value,
            password: await hashing(password.value),
        }),
    });

    if (!response.ok) {
        alert(`An error has occurred ${response.status}`);
        console.error("There was a problem with the fetch operation");
        return;
    }

    const data = await response.json();
    console.log(data);

    alert("Recipe updated successfully");
    window.location.reload();
});

delete_recipe_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/api/recipe_delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipeID: id,
            email: email.value,
            password: await hashing(password.value),
        }),
    });

    if (!response.ok) {
        alert(`An error has occurred ${response.status}`);
        console.error("There was a problem with the fetch operation");
        return;
    }

    const data = await response.json();
    console.log(data);

    alert("Recipe deleted successfully");
    window.location.reload();
});
