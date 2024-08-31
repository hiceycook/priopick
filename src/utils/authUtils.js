export const storeAuthToken = (token) => {
    localStorage.setItem('authToken', token);
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };
  
  export const removeAuthToken = () => {
    localStorage.removeItem('authToken');
  };
  
  export const storeUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  export const getUser = () => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  };
  
  export const removeUser = () => {
    localStorage.removeItem('user');
  };