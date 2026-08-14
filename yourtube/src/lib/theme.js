export const southStates = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
];

export const applyTheme = (state) => {
  const hour = new Date().getHours();

  const isSouth = southStates.includes(state);
  const isMorning = hour >= 10 && hour < 12;

  if (isSouth && isMorning) {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
  }
};