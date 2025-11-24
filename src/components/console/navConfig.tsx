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

import BookmarkIcon from '@mui/icons-material/Bookmark';

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
        label: 'Console.Nav.SearchListings.title',
        icon: Magnify,
        children: [
            {
                label: 'Console.Nav.SearchListings.searchOpportunity',
                href: '/console/opportunity/search',
                icon: TableSearch
            },
            // {
            //     label: 'Search Interest',
            //     href: '/console/interest/search',
            //     icon: TextBoxSearchOutline
            // },
            {
                label: 'Console.Nav.SearchListings.savedSearches',
                href: '/console/opportunity/search/saved',
                icon: BookmarkOutline
            }
        ]
    },
    {
        type: 'title',
        label: 'Console.Nav.MyOpportunities.title',
        icon: BriefcaseOutline,
        children: [
            {
                label: 'Console.Nav.MyOpportunities.postOpportunity',
                href: '/console/opportunity/new',
                icon: AddOutlined
            },
            {
                label: 'Console.Nav.MyOpportunities.viewMyOpportunities',
                href: '/console/opportunity/me',
                icon: ClipboardTextOutline
            },
            {
                label: 'Console.Nav.MyOpportunities.callForProposals',
                href: '/console/call-for-proposals',
                icon: ClipboardTextOutline
            },
            {
                label: 'Console.Nav.MyOpportunities.viewFavourites',
                href: '/console/opportunity/favourites',
                icon: BookmarkIcon
            }
        ]
    },
    {
        type: 'title',
        label: 'Console.Nav.MyApplications.title',
        icon: TextBoxMultipleOutline,
        children: [
            {
                label: 'Console.Nav.MyApplications.myApplications',
                href: '/console/applications',
                icon: ClipboardTextOutline
            },
            {
                label: 'Console.Nav.MyApplications.startApplication',
                href: '/console/applications/new',
                icon: AddOutlined
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
        label: 'Console.Nav.MyMessages.title',
        icon: EmailOutline,
        children: [
            {
                label: 'Console.Nav.MyMessages.chat',
                href: '/console/chat',
                icon: EmailOutline,
            },
            // {
            //     label: 'Sent Messages',
            //     href: '/console/notification/sent',
            //     icon: EmailArrowRightOutline
            // },
            // {
            //     label: 'Received Messages',
            //     href: '/console/notification/received',
            //     icon: EmailArrowLeftOutline
            // }
        ]
    },
    {
        type: 'title',
        label: 'Console.Nav.Account.title',
        icon: AccountCogOutline,
        children: [
            {
                label: 'Console.Nav.Account.myProfile',
                href: '/console/profile/account',
                icon: AccountCircleOutline
            },
            {
                label: 'Console.Nav.Account.myOrganization',
                href: '/console/profile/organization',
                icon: OfficeBuildingOutline
            },
            {
                label: 'Console.Nav.Account.changePassword',
                href: '/console/profile/password',
                icon: LockReset
            }
        ]
    },
    {
        type: 'title',
        label: 'Console.Nav.UserManagement.title',
        icon: AccountPlusOutline,
        children: [
            {
                label: 'Console.Nav.UserManagement.inviteUsers',
                href: '/console/admin/invite',
                icon: AccountPlusOutline,
                requiredRoles: ['admin', 'org_admin']
            },
            {
                label: 'Console.Nav.UserManagement.manageUsers',
                href: '/console/admin/users',
                icon: AccountCogOutline,
                requiredRoles: ['admin', 'org_admin']
            },
            {
                label: 'Console.Nav.UserManagement.organizations',
                href: '/console/admin/organizations',
                icon: OfficeBuildingOutline,
                requiredRoles: ['admin', 'org_admin']
            }
        ]
    },
    {
        type: 'title',
        label: 'Console.Nav.SystemInformation.title',
        hide: true,
        icon: CogOutline,
        children: [
            {
                label: 'Console.Nav.SystemInformation.adminDashboard',
                icon: ViewDashboardOutline,
                href: '/console/admin/status'
            },
            {
                label: 'Console.Nav.SystemInformation.serverStatus',
                href: '/console/admin/status',
                icon: ServerNetworkOutline
            }
        ]
    }
];
