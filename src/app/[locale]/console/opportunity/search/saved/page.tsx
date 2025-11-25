import { Link } from '@/i18n/navigation';

export default function Page() {
    return (
        <div>
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/console">Return Home</Link>
        </div>
    )
}