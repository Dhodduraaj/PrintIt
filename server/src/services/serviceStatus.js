let isServiceOpen = true;

const getServiceStatus = () => isServiceOpen;

const setServiceStatus = (open) => {
  isServiceOpen = Boolean(open);
};

module.exports = {
  getServiceStatus,
  setServiceStatus,
};

