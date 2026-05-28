/// <amd-module name="signupViewModel" />
declare var define: any;
interface Usuario {
    id: number;
    roleId: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}
declare function showLogAlert(message: string, backgroundColor: string): void;
