ChatProgram/YH/0111_2
npm start

dependency
"express": "^4.17.1",
"nodemon": "^2.0.7"

reference
https://www.youtube.com/watch?v=USrMdBF0zcg


ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

pem 파일은 github에 올라가면 안 돼서 .gitignore 로 없애놨음

만드는 방법
경로: ChatProgram/YH/0111_2
1 mkdir cert
2 cd cert 
3 openssl genrsa -out key.pem
4 openssl req -new -key key.pem -out csr.pem
Country Name: KR
State or Province Name:
Locality Name:
Organization Name: DJGM
Organizational Unit Name:
Common Name:
Email Address: "your_email_address@aaa.com"
5 openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
6 cd ..
7 npm start

추가적으로 해야하는 것(mac)
chrome 으로 들어가 url 창에  "chrome://flags" 검색
"allow invalid certificates" 검색
disable -> enabled 로 변경