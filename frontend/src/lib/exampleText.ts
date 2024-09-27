// exampleText.ts
export const exampleText = `
// Welcome to Numbers.
// Here's a quick guide to show you what this app can do.

// 1. You can assign variables.
x = 10
y = 5

// 2. Perform mathematical operations with variables.
x + y
x * y

// 3. Use the sum function to sum specific lines.
sum(3, 4) // This sums the results of line 3 and 4.

// 4. Leave comments with double slashes.
sum(2, 3) // This won't include this comment in the calculation.

// 5. Try deleting or modifying lines to see dynamic changes.
`;

// Function to check if this is the first time the user runs the app.
export const checkFirstRun = (): boolean => {
    const firstRun = localStorage.getItem("firstRun") === null;
    if (firstRun) {
        localStorage.setItem("firstRun", "0"); // Set flag to indicate this is no longer the first run
    }
    return firstRun;
};
