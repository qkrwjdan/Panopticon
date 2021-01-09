git init        //무조건 내가 하려는 최상위 폴더를 init 해야한다!!
git remote add origin https://github.com/qkrwjdan/valueup.git
git pull

-> 이때 
"""See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> master"""
와 같은 오류가 난다면 
https://insapporo2016.tistory.com/53 
https://yenaworldblog.wordpress.com/2018/02/28/git-checkout-error-the-following-untracked-working-tree-files-would-be-overwritten-by-checkout/

git fetch
git reset --hard origin/master

git status
를 통해 현재 commit이 안되는 파일이나 untracked file들이 있는지 확인

untracked 된 파일의 경우    ->      git add ChatProgram/YH/0109/
이후 VSC 에서 직접 pull 을 한다

ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
어플 제작 과정 readme


리액트를 이용한 webrtc를 사용하기 전, 가장 기본적인 틀을 잡는 과정
https://www.youtube.com/watch?v=JhyY8LdAQHU

0109 폴더

npm init -y

npm install -g create-react-app 

create-react-app client

npm install express socket.io


client 폴더

npm install socket.io-client uuid react-router-dom 