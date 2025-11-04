import type { ElementType } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';

import { AddOutlined } from '@mui/icons-material';

import Magnify from 'mdi-material-ui/Magnify';
import TableSearch from 'mdi-material-ui/TableSearch';
import TextBoxSearchOutline from 'mdi-material-ui/TextBoxSearchOutline';

import BriefcaseOutline from 'mdi-material-ui/BriefcaseOutline';
import ClipboardTextOutline from 'mdi-material-ui/ClipboardTextOutline';
import StarOutline from 'mdi-material-ui/StarOutline';

import HeartOutline from 'mdi-material-ui/HeartOutline';
import TextBoxMultipleOutline from 'mdi-material-ui/TextBoxMultipleOutline';

import EmailOutline from 'mdi-material-ui/EmailOutline';
import EmailArrowRightOutline from 'mdi-material-ui/EmailArrowRightOutline';
import EmailArrowLeftOutline from 'mdi-material-ui/EmailArrowLeftOutline';
import BookmarkOutline from 'mdi-material-ui/BookmarkOutline';

import AccountCircleOutline from 'mdi-material-ui/AccountCircleOutline';
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline';
import OfficeBuildingOutline from 'mdi-material-ui/OfficeBuildingOutline';
import LockReset from 'mdi-material-ui/LockReset';
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline';

import CogOutline from 'mdi-material-ui/CogOutline';
import ViewDashboardOutline from 'mdi-material-ui/ViewDashboardOutline';
import ServerNetworkOutline from 'mdi-material-ui/ServerNetworkOutline';

/** Works with both MUI and MDI icon components */
export type IconType = ElementType<any> | SvgIconComponent;

export type NavLeaf = {
    label: string;
    href: string;
    icon?: IconType;
    requiredRoles?: string[];
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
        icon: Magnify,
        children: [
            {
                label: 'Search Opportunity',
                href: '/console/opportunity/search',
                icon: TableSearch
            },
            // {
            //     label: 'Search Interest',
            //     href: '/console/interest/search',
            //     icon: TextBoxSearchOutline
            // },
            {
                label: 'Saved Searches',
                href: '/console/opportunity/search/saved',
                icon: BookmarkOutline
            }
        ]
    },
    {
        type: 'title',
        label: 'My Opportunities',
        icon: BriefcaseOutline,
        children: [
            {
                label: 'Post Opportunity',
                href: '/console/opportunity/new',
                icon: AddOutlined
            },
            {
                label: 'View My Opportunities',
                href: '/console/opportunity/me',
                icon: ClipboardTextOutline
            },
            {
                label: 'View Favourites',
                href: '/console/opportunity/favourites',
                icon: StarOutline
            }
        ]
    },
    // {
    //     type: 'title',
    //     label: 'My Interests',
    //     icon: HeartOutline,
    //     children: [
    //         {
    //             label: 'Post New Interest',
    //             href: '/console/interest/new',
    //             icon: AddOutlined
    //         },
    //         {
    //             label: 'View My Interests',
    //             href: '/console/interest',
    //             icon: TextBoxMultipleOutline
    //         }
    //     ]
    // },
    {
        type: 'title',
        label: 'My Messages',
        icon: EmailOutline,
        children: [
            {
                label: 'Sent Messages',
                href: '/console/notification/sent',
                icon: EmailArrowRightOutline
            },
            {
                label: 'Received Messages',
                href: '/console/notification/received',
                icon: EmailArrowLeftOutline
            }
        ]
    },
    {
        type: 'title',
        label: 'Account',
        icon: AccountCogOutline,
        children: [
            {
                label: 'My Profile',
                href: '/console/profile/account',
                icon: AccountCircleOutline
            },
            {
                label: 'My Organization',
                href: '/console/profile/organization',
                icon: OfficeBuildingOutline
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
        label: 'User Management',
        icon: AccountPlusOutline,
        children: [
            {
                label: 'Invite Users',
                href: '/console/admin/invite',
                icon: AccountPlusOutline,
                requiredRoles: ['admin', 'org_admin']
            },
            {
                label: 'Manage Users',
                href: '/console/admin/users',
                icon: AccountCogOutline,
                requiredRoles: ['admin', 'org_admin']
            },
            {
                label: 'Organizations',
                href: '/console/admin/organizations',
                icon: OfficeBuildingOutline,
                requiredRoles: ['admin', 'org_admin']
            }
        ]
    },
    {
        type: 'title',
        label: 'System Information',
        hide: true,
        icon: CogOutline,
        children: [
            {
                label: 'Admin Dashboard',
                icon: ViewDashboardOutline,
                href: '/console/admin/status'
            },
            {
                label: 'Server Status',
                href: '/console/admin/status',
                icon: ServerNetworkOutline
            }
        ]
    }
];
