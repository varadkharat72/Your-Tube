const southStates = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
];

export default function isSouthState(state) {
  return southStates.includes(state);
}