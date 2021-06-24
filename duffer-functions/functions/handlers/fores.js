const { db } = require('../util/admin');

exports.getAllFores = (req, res) => {
    db
    .collection('fores')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let fores = [];
        data.forEach(doc => {
            fores.push({
                foreId: doc.id,
                body: doc.data(),
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        });
        return res.json(fores);
        })
    .catch(err => { 
        console.error(err);
        res.status(500).json({ error: err.code });
    });
}

exports.postOneFore = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty' });
    }

  const newFore = {
      body:req.body.body, 
      userHandle: req.body.userHandle, 
      createdAt: new Date().toISOString()
  };

  db
   .collection('fores')
   .add(newFore)
   .then(doc => {
       res.json({ message: `document ${doc.id} created successfully`})
   })
   .catch(err => {
       res.status(500).json({ error: 'something went wrong' });
       console.error(err)
   }); 
}