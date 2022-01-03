/***Author: Mahjabin Sajadi***/

var express = require('express');
var path = require('path');

var bodyParser  = require('body-parser');
const {check, validationResult} = require('express-validator');


var session = require('express-session');

var myApp = express();

//mongoose
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mystore',{
    useNewUrlParser: true,
    useUnifiedTopology: true   
});

const Order = mongoose.model('Order',{
    username : String,
    email : String,
    phone : String, 
    postCode : String,
    product1 : Number,
    product2 : Number,
    product3 : Number,
    subTotal : Number,
    tax : Number,
    total : Number,
    Delivary : Number
});


// parse application/x-www-form-urlencoded
myApp.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
myApp.use(bodyParser.json())


myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');

myApp.get('/',function(req, res){
    res.render('Assignment');
});

myApp.get('/',function(req, res){
    res.render('Assignment');
});

//
//defining regular expressions
var phoneRegex = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
var postRegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;

//function to check a value using regular expression
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}
// Custom phone validation function
function customPhoneValidation(value){
    if(!checkRegex(value, phoneRegex)){
        throw new Error('Phone should be in the format xxx-xxx-xxxx');
    }
    return true;
}
// Custom post Code validation function
function customPostCodeValidation(value){
    if(!checkRegex(value, postRegex)){
        throw new Error('post code should be in the format X2X 2X2');
    }
    return true;
}
//you have to buy atleast one product
var positiveNum = /^[1-9][0-9]*$/;

function customProductValidation(value, {req}){
    var product1 = req.body.product1;

      if(!checkRegex(product1, positiveNum)){
        throw new Error('Please select product. product should be a number');
    }
    else{
        product1 = parseInt(product1);
        if(product1 < 1 ){
            throw new Error('You have to buy atleast one product');
        }
    }
    return true;
}
myApp.post('/',[
        check('username', 'Must have a name').not().isEmpty(),
        check('email', 'Must have email').isEmail(),
        check('address', 'Must have to enter your address').not().isEmpty(),
        check('city', 'Must have to enter your city name').not().isEmpty(),
        check('postCode').custom(customPostCodeValidation),
        check('phone').custom(customPhoneValidation),
        check('product1').custom(customProductValidation)
    ],
    function(req, res){
        const errors = validationResult(req);
        console.log(req.body);
        if (!errors.isEmpty()){
            res.render('Assignment', {
                errors:errors.array()
            })
        }
        else {
            var name = req.body.username;
            var email = req.body.email;
            var phone = req.body.phone;
            var postcode = req.body.postCode;
            var city = req.body.city;
            var province = req.body.Provinve;
            var street = req.body.address;
            var product1 = req.body.product1;
            var product2 = req.body.product2;
            var product3 = req.body.product3;
            var shipping = req.body.Delivary;

            var subTotal =0;
            var R1=0 ,R2=0,R3=0;

            var fullAddress = street + city + province + postcode;

            if(product1 != ""){
                R1 = product1 * 10;
            }
            else{
               //
            }
            if(product2 != ""){
                 R2 = product1 * 20;
            }
            else{
               //
            }
            if(product3 != ""){
                 R3 = product1 * 30;
            }
            else{
               //
            }
            subTotal = R1 + R2 + R3;
            var tax = subTotal * 0.13;
            
            // calculate Provinve tax
                var provinceTax = 0; 
                var provinceTax1 = 0.13;
                var provinceTax2 = 0.12;
                var provinceTax3 = 0.15;

                if(req.body.Provinve.value == "01")
                {
                    provinceTax = provinceTax1;
                }
                if(req.body.Provinve.value == "02")
                {
                    provinceTax = provinceTax2;
                }
                if(req.body.Provinve.value == "03")
                {
                    provinceTax = provinceTax3;
                }

                var total = subTotal + provinceTax;

            //shipping
            if(shipping == "01")
            {
                shipping = 30;
            }
            if(shipping == "02")
            {
                shipping = 25;
            }
            if(shipping == "03")
            {
                shipping = 20;
            }
            if(shipping == "04")
            {
                shipping = 15;
            }

            var pageReciept = {
                username : name,
                email : email,
                phone : phone, 
                postCode : fullAddress,
                product1 : product1,
                product2 : product2,
                product3 : product3,
                subTotal : subTotal,
                tax : tax,
                total : total,
                Delivary : shipping,
            }
            var myOrder = new Order(pageReciept);
                myOrder.save().then( ()=>{
                    console.log('New order information saved in database');
                });

            res.render('Reciept', pageReciept);

           
        }
       
  
    }
);

myApp.get('/MongoosResult',function(req,res){
    Order.find({}).exec(function(err,orders){
        res.render('MongoosResult',{orders:orders});
    });
});

myApp.listen(5000);
console.log('Server started at 5000 for mywebsite...');
