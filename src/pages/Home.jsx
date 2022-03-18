import React, { useState, useEffect } from "react";
import CSVInput from "../components/CSVInput";
// import Web3 from "web3";
import { Contract, ethers } from 'ethers'


const Home = (props) => {
    const [address, setAddress] = useState(null)

    const checkIfWalletIsConnected = async () => {
        /*
         * First make sure we have access to window.ethereum
         */
        const { ethereum } = window;

        if (!ethereum) {
            console.log('Make sure you have MetaMask!');
            return;
        } else {
            console.log('We have the ethereum object', ethereum);
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            setAddress(accounts)

            /*
             * User can have multiple authorized accounts, we grab the first one if its there!
             */
            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log('Found an authorized account:', account);
            }
        };
    }

    const connectWalletAction = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert('Get MetaMask!');
                return;
            }

            /*
             * Fancy method to request access to account.
             */
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });

            /*
             * Boom! This should print out public address once we authorize Metamask.
             */
            console.log('Connected', accounts[0]);
            setAddress(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);


    return (
        <>
            <h1>Welcome to NFT for all</h1>
            <button onClick={() => {
                connectWalletAction()
            }}>Connect Wallet</button>
            <br />
            <p>{address}</p>
            <h3>Upload Your CSV file with addreses</h3>
            <CSVInput />
        </>
    )
}

export default Home