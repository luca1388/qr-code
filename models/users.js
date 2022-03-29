const usersUrl = "https://api-project-941743174493.firebaseio.com/users.json";
const patchUserUrl = (userid) =>
  `https://api-project-941743174493.firebaseio.com/users/${userid}.json`;

const getDBUser = async (chatId) => {
  const users = await readUsersList();
  return users.find((user) => user.chat_id === chatId);
};

const patchUser = async (id, data) => {
  let response;
  console.log("patching user with data:");
  console.log(data);
  try {
    response = await fetch(patchUserUrl(id), {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    console.log("User updated");
  } catch (e) {
    console.log("User not updated");
    throw new Error(e);
  }

  if (response.status === 200) {
    console.log("User updated with success");
  }
};

const createUser = async (user) => {
  console.log("Creating this user: ");
  console.log(user);
  console.log(`url: ${usersUrl}`);
  let response;
  try {
    response = await fetch(usersUrl, {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json" },
    });
    console.log("User created");
  } catch (e) {
    console.log("User not created");
    throw new Error(e);
  }

  console.log(response.status);
  if (response.status === 200) {
    console.log("User created with success");
  }

  const data = await response.json();

  // id of new item created in DB
  return data.name;
};

const readUsersList = async () => {
  let response, users;
  try {
    response = await fetch(usersUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    users = await response.json();
  } catch (e) {
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
