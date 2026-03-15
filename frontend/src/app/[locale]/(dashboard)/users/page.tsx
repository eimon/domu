import { getUsers } from "@/actions/users";
import UsersTable from "@/components/UsersTable";
import AddUserDialog from "@/components/AddUserDialog";
import { getTranslations } from "next-intl/server";

export default async function UsersPage() {
    const users = await getUsers();
    const t = await getTranslations("Users");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white/90">{t("title")}</h1>
                </div>
                <AddUserDialog />
            </div>

            <UsersTable users={users} />
        </div>
    );
}
