const API_URL = process.env.REACT_APP_API_URL;
const IMGUR_CLIENT_ID = process.env.REACT_APP_IMGUR_CLIENT_ID;

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

interface RegistrationForm {
  username: string;
  lastname: string;
  firstname: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export default class Api {
  public static login = (email: string, password: string): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify({
            email,
            password,
          }),
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static register = (registrationForm: RegistrationForm): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(registrationForm),
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static uploadImage = (fileFormData: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`https://api.imgur.com/3/image/`, {
          method: "POST",
          headers: {
            Authorization: "Client-ID " + IMGUR_CLIENT_ID,
          },
          body: fileFormData,
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static getLoggedInUserInfo = (jwt: string | null): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${API_URL}/auth`, {
          headers: {
            "X-Auth": `${jwt}`,
          },
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static getContacts = (jwt: string | null): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${API_URL}/contacts`, {
          headers: {
            "X-Auth": `${jwt}`,
          },
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static getMessages = (
    jwt: string | null,
    uuid: string | null | undefined
  ): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        if (uuid === undefined) reject("uuid is undefined");
        const res = await fetch(`${API_URL}/messages/${uuid}`, {
          headers: {
            "X-Auth": `${jwt}`,
          },
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static getUnreadMessages = (
    jwt: string | null,
    uuid: string | null | undefined
  ): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        if (uuid === undefined) reject("uuid is undefined");
        const res = await fetch(`${API_URL}/messages/${uuid}?unread`, {
          headers: {
            "X-Auth": `${jwt}`,
          },
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static addContact = (
    jwt: string | null,
    contactId: string | null | undefined,
    contactName: string | null | undefined
  ): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        if (contactId === undefined) reject("contact id is undefined");
        const res = await fetch(`${API_URL}/contacts/${contactId}`, {
          method: "POST",
          headers: {
            "X-Auth": `${jwt}`,
          },
          body: JSON.stringify({ name: contactName }),
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });

  public static deleteContact = (
    jwt: string | null,
    contactId: string | null | undefined
  ): Promise<any> =>
    new Promise(async (resolve, reject) => {
      try {
        if (contactId === undefined) reject("contact id is undefined");
        const res = await fetch(`${API_URL}/contacts/${contactId}`, {
          method: "DELETE",
          headers: {
            "X-Auth": `${jwt}`,
          },
        });
        const data = await res.json();
        resolve({
          status: res.status,
          data,
        });
      } catch (error) {
        reject(error);
      }
    });
}
