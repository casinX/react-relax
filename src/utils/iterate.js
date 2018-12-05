export default (iterateTarget, callback) => {
  Object.getOwnPropertySymbols(iterateTarget).forEach((key, index) => callback(iterateTarget[key], key, index));
};