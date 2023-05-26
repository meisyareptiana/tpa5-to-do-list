const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const TodoModel = require("./models").Todo;

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3030;
const dataUsers = [
  {
    user_id: 1,
    email: "meisya@gmail.com",
    password: "12345678",
    role: "admin",
  },
  {
    user_id: 2,
    email: "intan@gmail.com",
    password: "abcdefg",
    role: "premium",
  },
  {
    user_id: 3,
    email: "denina@gmail.com",
    password: "abcdefg",
    role: "basic",
  },
];

let checkData = (req, res, next) => {
  // console.log(`Saya Mengecek Data Ini : ${req.body}`)
  next();
};

let checkUser = (req, res, next) => {
  let response = {};
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    response = {
      status: "ERROR",
      message: "Authorization Failed",
    };
    res.status(401).json(response);
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    console.log(error);
    if (error) {
      response = {
        status: "ERROR",
        message: error,
      };
      res.status(401).json(response);
      return;
    }
    req.user = user;
    next();
  });
};

app.use(checkData);

// Melihat data user
app.get("/users", (req, res) => {
  res.json(dataUsers);
});

// Menambahkan data user
app.post("/users", (req, res) => {
  let response = {
    user_id: dataUsers.length + 1,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  };
  dataUsers.push(response);
  res.json(response);
});

// Melihat semua todo
app.get("/todos", async (req, res) => {
  try {
    const todos = await TodoModel.findAll();
    const response = {
      status: "SUCCESS",
      message: "Get All Company",
      meta: {
        total: todos.lenght,
      },
      data: todos,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
  return;
});

// Melihat detail todo
app.get("/todos/:id", async (req, res) => {
  let response = {};
  const todos = await TodoModel.findAll({
    where: {
      id: req.params.id,
    },
  });

  if (todos.length == 0) {
    response = {
      status: "SUCCESS",
      message: "Data not Found",
    };
  } else {
    response = {
      status: "SUCCESS",
      message: "Get Detail Company",
      data: todos,
    };
  }

  res.status(200).json(response);
  return;
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let response = {};
  let foundUser = {};

  for (let i = 0; i < dataUsers.length; i++) {
    if (dataUsers[i].email == email) {
      foundUser = dataUsers[i];
    }
  }

  if (Object.keys(foundUser).length == 0) {
    response = {
      status: "ERROR",
      message: "User not Found",
    };
    res.status(401).json(response);
    return;
  }

  if (foundUser.password != password) {
    response = {
      status: "ERROR",
      message: "Combination Email and Password not Match",
    };
    res.status(401).json(response);
    return;
  }

  let jwt_payload = {
    user_id: foundUser.user_id,
  };

  let access_token = jwt.sign(jwt_payload, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
  response = {
    status: "SUCCESS",
    access_token: access_token,
  };
  res.json(response);
});

app.use(checkUser);

// Membuat todo baru
app.post("/todos", async (req, res) => {
  let response = {};
  let code = 200;
  if (req.body.title == "" || req.body.title == undefined) {
    code = 422;
    response = {
      status: "SUCCESS",
      message: "title cannot be blank",
    };
  }
  if (req.body.description == "" || req.body.description == undefined) {
    code = 422;
    response = {
      status: "SUCCESS",
      message: "description cannot be blank",
    };
  }
  try {
    const newTodo = await TodoModel.create({
      title: req.body.title,
      description: req.body.description,
    });

    response = {
      status: "SUCCESS",
      message: "Create Todo",
      data: newTodo,
    };
  } catch (error) {
    code = 422;
    response = {
      status: "ERROR",
      message: error.parent.sqlMessage,
    };
  }
  res.status(code).json(response);
  return;
});

// Update Todo
app.patch("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updateTodoData = {
      title: title,
      description: description,
    };
    const updatedTodo = await TodoModel.update(updateTodoData, {
      where: {
        id: id,
      },
    });
    res.status(200).json({
      message: "Update todo success",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
});

// Menghapus Todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await TodoModel.destroy({
      where: {
        id: id,
      },
    });
    res.status(200).json({
      message: "Delete todo success",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
});

app.listen(port, () => {
  console.log(`This Application Run on Port : ${port}`);
});
