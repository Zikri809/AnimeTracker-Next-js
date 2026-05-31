import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "User Profile",
  description:
    "Private anime profile and watch statistics for the signed-in user.",
  path: "/mylist/user_profile",
  noIndex: true,
});

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
