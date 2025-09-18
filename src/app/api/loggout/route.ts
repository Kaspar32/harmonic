import { NextResponse } from 'next/server';


export async function POST(){

    const res = NextResponse.json({ message: 'Logged out'});
    res.cookies.delete({name: 'userId', path: '/'});
    return res;

}