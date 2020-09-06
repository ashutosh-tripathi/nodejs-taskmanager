const sgmail=require('@sendgrid/mail')
const sendgridAPIkey='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'
sgmail.setApiKey(sendgridAPIkey)
sgmail.send({
    to:'steveisthedaddy@yahoo.com',
    from:'steveisthedaddy@yahoo.com',
    subject:'This is my fist Creation!',
    text:'My First Email!!!'
})