
// Utility function to check if a email is valid
export function isValidEmail(email) {
  try {
    // Require at least 2 characters after the last dot (TLD)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email === "") {
      return {isValid: false, errorMessage: "Email is required."};
    }
    if (!emailRegex.test(email)) {
      return {isValid: false, errorMessage: "Email address is not valid."};
    }
    return {isValid: true, errorMessage: ""};
  } catch (error) {
    console.error("Error in isValidEmail:", error);
    return null;
  }
}

// Utility function to check if a username is valid
export function isValidUsername(username) {
  try {
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // At least 3 characters, alphanumeric and underscores allowed
    if (username === "") {
      return {isValid: false, errorMessage: "Username is required."};
    }
    if (!usernameRegex.test(username)) {
      console.error("Username validation error: Username must be at least 3 characters long and can only contain letters, numbers, and underscores.", "For username: ", username);
      return {
        isValid: false, 
        errorMessage: "Must be at least 3 characters long and can only contain letters, numbers, and underscores."
      };
    }
    return {isValid: true, errorMessage: ""};
  } catch (error) {
    console.error("Error in isValidUsername:", error);
    return null;
    }
  }

// Utility function to check if a passwprd is valid
export function isValidPassword(password) {
  try {
    const pw_min_len = 8;
    const hasUpperCase = password !== password.toLowerCase();
    const hasLowerCase = password !== password.toUpperCase();
    const hasDigits = /\d/.test(password);
    const getPwError = (pw) => {
      if (pw === "") {
          return "Password is required.";
      }
      if (pw.length < pw_min_len) {
          return `Password must contain at least` + ` ${pw_min_len} ` + `characters.`;
      }
      if (!hasUpperCase) {
          return "Password must include uppercase characters.";
      }
      if (!hasLowerCase) {
          return "Password must include lowercase characters.";
      }
      if (!hasDigits) {
          return "Password must include digits.";
      }
      return null;
    }
    const error = getPwError(password);

    if (error) {
      console.error("Password validation error:", error);
      return {isValid: false, errorMessage: error};
    }
    return {isValid: true, errorMessage: null};
    

  } catch (error) {
    console.error("Error in isValidPassword:", error);
    return null;
  }
}
