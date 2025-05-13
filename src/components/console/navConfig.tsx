import { AddOutlined, AccountCircleOutlined, List, InfoOutlined, SvgIconComponent } from '@mui/icons-material';
import EmailArrowRightOutline from 'mdi-material-ui/EmailArrowRightOutline';
import EmailArrowLeftOutline from 'mdi-material-ui/EmailArrowLeftOutline';
import LockReset from 'mdi-material-ui/LockReset';
import ContentSave from 'mdi-material-ui/BookSearchOutline';
import Search from 'mdi-material-ui/ViewListOutline';
// import SearchInterest from 'mdi-material-ui/TextBoxSearchOutline';
import ViewMyInterest from 'mdi-material-ui/TextBoxMultipleOutline';
import ViewDashboardOutline from 'mdi-material-ui/ViewDashboardOutline';
import StarOutline from 'mdi-material-ui/StarOutline';

import type { ElementType } from 'react';

/** Use whatever icon type your project actually exports.
 *  `ElementType` works with MUI, @mdi/js react-icons, etc.  */
export type IconType = ElementType<any> | SvgIconComponent;

export type NavLeaf = {
    label: string;
    href: string;
    icon?: IconType;
};

export type NavSection = {
    type: 'title';
    label: string;
    icon?: IconType;
    hide?: boolean;
    children: NavLeaf[];
};

export type NavConfig = NavSection[];

export const navConfig: NavConfig = [
    {
        type: 'title',
        label: 'Search Listings',
        // icon: Search,
        children: [
            {
                label: 'Search Opportunity',
                href: '/console/opportunity/search',
                icon: Search,
            },
            {
                label: 'Search Interest',
                href: '/console/interest/search',
                icon: Search,
            },
        ]
    },
    {
        type: 'title',
        label: 'My Opportunities',
        // icon: List,
        children: [
            {
                label: 'Post New Opportunity',
                href: '/console/opportunity/new',
                icon: AddOutlined,
            },
            {
                label: 'View My Opportunities',
                href: '/console/opportunity',
                icon: List,
            },
            {
                label: 'View Favourites',
                href: '/console/opportunity/favourites',
                icon: StarOutline,
            },
        ]
    },
    {
        type: 'title',
        label: 'My Interests',
        // icon: List,
        children: [
            {
                label: 'Post New Interest',
                href: '/console/interest/new',
                icon: AddOutlined,
            },
            {
                label: 'View My Interests',
                href: '/console/interest',
                icon: ViewMyInterest,
            },
        ]
    },
    {
        type: 'title',
        label: 'My Messages',
        // icon: EmailSendOutline,
        children: [
            {
                label: 'Sent Messages',
                href: '/console/notification/sent',
                icon: EmailArrowRightOutline,
            },
            {
                label: 'Received Messages',
                href: '/console/notification/received',
                icon: EmailArrowLeftOutline,
            },
            {
                label: 'Saved Searches',
                href: '/console/notification/received',
                icon: ContentSave,
            },
        ]
    },
    {
        type: "title",
        label: 'Account',
        // hide: true,
        // icon: AccountCircleOutlined,
        children: [
            {
                label: 'My Profile',
                href: '/console/profile',
                icon: AccountCircleOutlined,
            },
            {
                label: 'Change Password',
                href: '/console/profile/password',
                icon: LockReset
            }
        ]
    },
    {
        type: 'title',
        label: 'System Information',
        hide: true,
        // icon: InfoOutlined,
        children: [
            {
                label: 'Admin Dashboard',
                icon: ViewDashboardOutline,
                href: '/console/admin/status',
            },
            {
                label: 'Server Status',
                href: '/console/admin/status',
                icon: InfoOutlined
            }
        ]
    }
]
