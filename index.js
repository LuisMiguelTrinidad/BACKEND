import express from "express";
import morgan from "morgan"
import cors from "cors";

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.static('dist'))

const morganFormatter = (tokens, req, res) => {
  const log = [
    tokens['method'](req, res),
    tokens['url'](req, res),
    tokens['status'](req, res),
    tokens['res'](req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ];
  if (tokens.method(req, res) === 'POST') {
    log.push(JSON.stringify(req.body));
  }

  return log.join(' ');
};

app.use(morgan(morganFormatter));

let contacts = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(contacts);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const contact = contacts.find((note) => note.id === id);
  if (contact) {
    response.json(contact);
  } else {
    response.status(404).send("<h1>404 Not found<h1/>").end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  contacts = contacts.filter((k) => k.id !== id);
  response.status(204).end();
});

app.get("/info", (request, response) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeZone: "Europe/Madrid",
    timeStyle: "full",
  });
  const formattedDate = formatter.format(now);
  console.log(formattedDate);
  response.send(
    `<p>Phonebook has ${contacts.length} people</p><p>${formattedDate}</p>`
  );
});

app.post("/api/persons", (request, response) => {
  if (!request.body.name || !request.body.number) {
    return response
      .status(400)
      .json({ error: "Incorrect request, contains invalid data" });
  }
  if (contacts.find((k) => k.name == request.body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  let contact = { ...request.body, id: generateId() };
  contacts = contacts.concat(contact);
  return response.json(contact);
});

const generateId = () => {
  return Math.round(Math.random() * 2 ** 30);
};

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
});
