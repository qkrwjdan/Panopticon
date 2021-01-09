나는 서예현이다.

git init
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

untracked 된 파일의 경우
git add ChatProgram/YH/0109/
이후 VSC 에서 직접 pull 을 한다