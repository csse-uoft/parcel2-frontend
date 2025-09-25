'use client'

import * as React from 'react';
import Image from 'next/image';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Copyright from '@/components/Copyright';
import background1 from '../../public/background-1.jpg'
import Header from "@/components/header/Header";
import { useUserContext } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";

function Background() {
    return (
        <Image
            alt="Mountains"
            src={background1}
            placeholder="blur"
            quality={100}
            fill
            sizes="100vw"
            style={{
                objectFit: 'cover',
                zIndex: -1,
            }}
        />
    )
}

export default function Home() {
    const {username, isLoading} = useUserContext();
    if (isLoading) {
        return <Loading/>;
    }
    return (
        <>
            <Header/>
            <Container maxWidth="lg">
                {/*<Background/>*/}
                <Box
                    sx={{
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >

                    <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                        Welcome to Parcel2
                    </Typography>
                    {/*<Link href="/about" color="secondary" component={NextLink}>*/}
                    {/*    Go to the about page*/}
                    {/*</Link>*/}
                    {/*<ProTip/>*/}
                    <Copyright/>
                </Box>
            </Container>
        </>
    );
}
