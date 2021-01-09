const users =[
    { email: "sky990106@dgu.ac.kr", password: "123", name:"Jung Jiyoung"}
]

export function signIn({ email, password}) {
    const user = users.find(
        (user) => user.email === email && user.password == password
    )
    if (user === undefined) throw new Error()
    return user
}