const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, check, validationResult } = require('express-validator');

const validator = require('validator');
const { default: isEmail } = require('validator/lib/isemail');

require('./utils/db');
const Contact = require('./model/contact');

const app = express();
const port = 3000;

// EJS Setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Halaman Utama',
    layout: 'layouts/main-layout',
  });
});

app.get('/contact', async (req, res) => {
  const contacts = await Contact.find();
  res.render('contact', {
    title: 'Contact List',
    layout: 'layouts/main-layout',
    contacts,
  });
});

app.get('/contact/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    res.render('detail', {
      title: 'Contact Detail',
      layout: 'layouts/main-layout',
      contact: contact,
    });
  } catch (e) {
    res.status('404');
    res.send('Cannot find contact with id ' + req.params.id);
  }
});

app.get('/contact/delete/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect('/contact');
  } catch (e) {
    res.status('404');
    res.send('Cannot find contact with id ' + req.params.id);
  }
});

app.post(
  '/contact',
  [
    body('nama').custom(async (value) => {
      const contacts = await Contact.find();
      if (contacts.find((contact) => contact.nama === value)) {
        throw new Error('Nama sudah digunakan');
      }
      return true;
    }),
    check('nohp', 'No handphone invalid').isMobilePhone('id-ID'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const errorsInArray = errors.array();
    let isEmailValid = true;
    if (req.body.email && !validator.isEmail(req.body.email)) {
      const emailInvalidMsg = { msg: 'Email is Invalid' };
      isEmailValid = false;
      errorsInArray.push(emailInvalidMsg);
    }
    if (!errors.isEmpty() || !isEmailValid) {
      const contacts = await Contact.find();
      res.render('contact', {
        title: 'Halaman Contact',
        layout: 'layouts/main-layout',
        contacts,
        errors: errorsInArray,
      });
      console.log(errors.array());
    } else {
      const contact = new Contact(req.body);
      await contact.save();

      res.redirect('/contact');
    }
  }
);

app.post(
  '/contact/:id',
  [
    body('nama').custom(async (value) => {
      const contacts = await Contact.find();
      if (contacts.find((contact) => contact.nama === value)) {
        throw new Error('Nama sudah digunakan');
      }
      return true;
    }),
    check('nohp', 'No handphone is invalid').isMobilePhone('id-ID'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const errorsInArray = errors.array();
    let isEmailValid = true;
    if (req.body.email && !validator.isEmail(req.body.email)) {
      const emailInvalidMsg = { msg: 'Email is Invalid' };
      isEmailValid = false;
      errorsInArray.push(emailInvalidMsg);
    }
    if (!errors.isEmpty() || !isEmailValid) {
      const contact = await Contact.findById(req.params.id);
      res.render('detail', {
        title: 'Contact Detail',
        layout: 'layouts/main-layout',
        contact,
        errors: errorsInArray,
      });
    } else {
      await Contact.findByIdAndUpdate(req.params.id, {
        nama: req.body.nama,
        nohp: req.body.nohp,
        email: req.body.email,
      });
      res.redirect('/contact/' + req.params.id);
    }
  }
);
app.listen(port, () => {
  console.log(`Mongo Contact App | listening to http://localhost:${port}`);
});
