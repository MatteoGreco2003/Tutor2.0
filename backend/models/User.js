import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    nome: {
      type: String,
      require: True,
    },
    cognome: {
      type: String,
      require: True,
    },
    email: {
      type: String,
      require: true,
    },
    passwd: {
      type: String,
      require: true,
    },
  },
  { timesamps: true }
);

const User = mongoose.model("User", userSchema);

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[]\.,;:\s@"]+(.[^<>()[]\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/
  );
};
