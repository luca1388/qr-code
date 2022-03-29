const usersUrl = "https://api-project-941743174493.firebaseio.com/users.json";
const patchUserUrl = (userid) =>
  `https://api-project-941743174493.firebaseio.com/users/${userid}.json`;

const getDBUser = async (chatId) => {
  const users = await readUsersList();
  return users.find((user) => user.chat_id === chatId);
};

const patchUser = async (id, data) => {
  let response;
  console.log("Patching user");
  try {
    response = await fetch(patchUserUrl(id), {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("User NOT updated");
    console.error(e);
  }

  if (response.status === 200) {
    console.log("User updated");
  }
};

const createUser = async (user) => {
  console.log("Creating new user");
  let response;
  try {
    response = await fetch(usersUrl, {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("User NOT created");
    console.error(e);
  }

  if (response.status === 200) {
    console.log("User created");
  }
};

const readUsersList = async () => {
  console.log("Getting users list");
  let response, users;
  try {
    response = await fetch(usersUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    users = await response.json();
    console.log("Users list read");
  } catch (e) {
    console.error("Not possible to get users list");
    console.error(e);
    users = [];
  }
  users = Object.keys(users).map((userKey) => ({
    ...users[userKey],
    id: userKey,
  }));
  return users;
};

module.exports = {
  getDBUser: getDBUser,
  patchUser: patchUser,
  readUsersList: readUsersList,
  createUser: createUser,
};
