import { redirect } from 'next/navigation';

export default function EditPostRedirect({ params }: { params: { id: string } }) {
  redirect(`/posts/${params.id}`);
}
