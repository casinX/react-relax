let wrappedMethod = null;


export default (method) => {
  return function (...args) {
    if(wrappedMethod === null){
      wrappedMethod = this.__asyncWrapper(method);
    }

    return wrappedMethod(...args);
  };
};