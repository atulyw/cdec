export function getAvatarUrl(name = "Student") {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(name)}`;
}
