const dotenv = require('dotenv').config();

// 몽고DB 연결
const mongoclient = require("mongodb").MongoClient;
const ObjId = require('mongodb').ObjectId;
const express = require ('express');
const app = express();
const url = process.env.DB_URL;

let mydb;
mongoclient.connect(url)
    .then(client => {
        mydb = client.db('webchat');

        app.listen(process.env.PORT, function(){
            console.log("포트 8080으로 서버 대기 중 ...");
        });
    }).catch(err=>{
        console.log(err);
});

const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const sha = require('sha256');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// ejs 템플릿 세팅, 템플릿 엔진은 'views' 폴더를 기본 작업 환경으로 인식
app.set('view engine', 'ejs');

// body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

// 메인 페이지 및 로그인
app.get('/',  async function(req, res){
    const token = req.cookies.token;
    if (!token) {
        res.sendFile(path.join(__dirname, 'public', 'login.html'))
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = new ObjId(decoded.id);
        const user = await mydb.collection('account').findOne({_id : userId});

        if (user) {
            res.render('mainpage.ejs', {user : user});
        }
        else {
            res.sendFile(path.join(__dirname, 'public', 'login.html'))
        }
    } catch {
        res.sendFile(path.join(__dirname, 'public', 'login.html'))
    }
})

// 회원가입 페이지
app.get('/register', async function(req, res) {
    res.render('register.ejs');
})

// 회원가입 요청
app.post('/register', async function(req, res) {
    const user = await mydb.collection('account').insertOne({
        ID : req.body.ID, Password : sha(req.body.password), Nickname : req.body.nickname
    })
    res.redirect('/')
})

// 아이디 중복 확인 요청
app.post('/overlapIDCheck', async function(req, res) {
    const user = await mydb.collection('account').findOne({
        ID : req.body.ID
    })
    if (user) {
        res.json({available : false});
    }
    else {  
        res.json({available : true});
    }
})

// 닉네임 중복 확인 요청
app.post('/overlapNicknameCheck', async function(req, res) {
    const user = await mydb.collection('account').findOne({
        Nickname : req.body.Nickname
    })
    if (user) {
        res.json({available : false});
    }
    else {  
        res.json({available : true});
    }
})

// 로그인 요청
app.post('/login', async function(req, res) {
    const user = await mydb.collection('account').findOne({ID : req.body.ID})

    if (user) {
        if (user.Password === sha(req.body.Password)){
            const token = jwt.sign({ id: user._id, username: user.ID }, process.env.JWT_SECRET, { expiresIn: '10h' });

            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });  // 클라이언트로 토큰 전송
            res.redirect('/')
        }
    }
    else {
        res.send('login fail')
    }
})