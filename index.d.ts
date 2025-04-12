interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
}
interface SignInParams {
    email: string;
    idToken: string;
}

interface User {
    name: string;
    email: string;
    id: string;
    role: Role;
}
interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
}

type Role = 'department' | 'finance' | 'viewer' | 'admin';
