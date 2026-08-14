import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

import { useState, createContext, useEffect, useContext } from "react";

import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { southStates, applyTheme } from "./theme";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await res.json();
            const city =
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.municipality ||
              "Unknown";
            const state = data?.address?.state || "Unknown";
            const payload = {
              email: firebaseuser.email,
              name: firebaseuser.displayName,
              image: firebaseuser.photoURL || "https://github.com/shadcn.png",
              location: city,
              state: state,
            };

            const response = await axiosInstance.post("/user/login", payload);
            const loggedInUser = {
              ...response.data.result,
              location: city,
              state: state,
            };
            login(loggedInUser);
            applyTheme(state);
            const isSouthState = southStates.includes(state);
            if (isSouthState) {
              try {
                const otpResponse = await axiosInstance.post("/otp/send", {
                  userId: response.data.result._id,
                });
                window.location.href = "/otp?method=email";
              } catch (otpError) {
                console.error("EMAIL OTP ERROR:", otpError);
                console.error("OTP STATUS:", otpError?.response?.status);
                console.error("OTP RESPONSE:", otpError?.response?.data);
                alert(
                  otpError?.response?.data?.message ||
                    "Unable to send OTP to your email.",
                );
              }
              return;
            }
            window.location.href = "/mobile";
          } catch (error) {
            console.error("Location/Login failed:", error);
            console.error("Backend response:", error?.response?.data);
          }
        },
        async () => {
          try {
            const payload = {
              email: firebaseuser.email,
              name: firebaseuser.displayName,
              image: firebaseuser.photoURL || "https://github.com/shadcn.png",
              location: "Unknown",
              state: "Unknown",
            };
            const response = await axiosInstance.post("/user/login", payload);
            console.log("Fallback login response:", response.data);
            login(response.data.result);
            applyTheme("Unknown");
            window.location.href = "/mobile";
          } catch (error) {
            console.error("Fallback login error:", error);
            console.error("Backend response:", error?.response?.data);
          }
        },
      );
    } catch (error) {
      console.error("Google Sign In Error:", error);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser?.state) {
        applyTheme(savedUser.state);
      }
    } catch (error) {
      console.error("Saved user/theme error:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseuser) => {
      if (firebaseuser) {
        try {
          const savedUser = JSON.parse(localStorage.getItem("user"));
          if (savedUser) {
            setUser(savedUser);
            if (savedUser.state) {
              applyTheme(savedUser.state);
            }
          }
        } catch (error) {
          console.error("Auth state error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        handlegooglesignin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
