import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';


export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.headlessteam.aora",
  projectId: "66d9494600265bd70c17",
  databaseId: "66d94ca4000133e4a7c8",
  userCollectionId: "66d94cba0037923f99d6",
  videoCollectionId: "66d94cde002423915d52",
  storageId: "66d94e540026d211e873"
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId
} = config;

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId) // Your project ID
    .setPlatform(platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars  = new Avatars(client);
const databases = new Databases(client);

// CREATE USER
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    if (!newAccount) throw new Error("Failed to create user");

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    )

    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

// SIGN IN
export const signIn = async (email, password) => {
  try {
    await account.deleteSession("current");
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

// GET CURRENT USER
export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if(!currentAccount) throw new Error("Failed to get current user");

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if(!currentUser) throw new Error("Failed to get current user");

    return currentUser.documents[0];

  } catch (error) {
    console.error(error);
  }
}


// GET ALL POSTS
export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId
    )

    return posts.documents
  } catch (error) {
    console.error(error);
  }
}

// GET LATEST POSTS
export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [
        Query.orderDesc('$createdAt', Query.limit(7)),
      ]
    )

    return posts.documents
  } catch (error) {
    console.error(error);
  }
}