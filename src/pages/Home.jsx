import React, { useState, useEffect } from "react";
import CSVInput from "../components/CSVInput";
// import Web3 from "web3";
import { Contract, ethers } from 'ethers'
import NFTForm from "../components/NFTForm"
import config from "../config/index"
import DeployContractABI from "../config/DeployContractABI"
import NFTBulkMintABI from "../config/NFTBulkMint";
import { useCSVReader } from 'react-papaparse';
const Home = (props) => {
    const [address, setAddress] = useState(null)
    const [NFTName, setNFTName] = useState(null)
    const [NFTSymbol, setNFTSymbol] = useState(null)
    const [NFTUri, setNFTUri] = useState(null)
    const [contractInstance, setContractInstance] = useState(null)
    const [usersNFTContract, setUsersNFTContract] = useState(null)
    const [providerInstance, setProviderInstance] = useState(null)
    const [bulkMintContract, setBulkMintContract] = useState(null)
    const [signerObject, setSigner] = useState(null)
    const [addressArray, setAddressArray] = useState(null)
    let NFTContract;


    const styles = {
        csvReader: {
            display: 'flex',
            flexDirection: 'row',
            marginBottom: 10,
        },
        browseFile: {
            width: '20%',
        },
        acceptedFile: {
            border: '1px solid #ccc',
            height: 45,
            lineHeight: 2.5,
            paddingLeft: 10,
            width: '80%',
        },
        remove: {
            borderRadius: 0,
            padding: '0 20px',
        },
        progressBarBackgroundColor: {
            backgroundColor: 'green',
        },
    };

    const CSVInput = () => {
        // State varibale for csv data
        const [data, setData] = useState([]);

        // Helper function to convert csv data to array
        const arrayHelper = (arrayData) => {
            let arrayElements = []
            arrayData.data.forEach(element => {
                console.log(element)
                if (element != '')
                    arrayElements.push(element[0])
            });
            console.log(arrayElements)
            // return arrayElements
            // setData(arrayElements)
            // setAddressArray(arrayElements)

            mintNFTs(arrayElements)
        }

        const { CSVReader } = useCSVReader();
        return (
            <>
                <CSVReader
                    onUploadAccepted={(results) => {
                        console.log('--------    CSV FILE  -------------------');
                        setData(arrayHelper(results))
                        console.log('----------  ARRAY  -----------------');

                    }}
                >
                    {({
                        getRootProps,
                        acceptedFile,
                        ProgressBar,
                        getRemoveFileProps,
                    }) => (
                        <>
                            <div style={styles.csvReader}>
                                <button type='button' {...getRootProps()} style={styles.browseFile}>
                                    File
                                </button>
                                <div style={styles.acceptedFile}>
                                    {acceptedFile && acceptedFile.name}
                                </div>
                                <button {...getRemoveFileProps()} style={styles.remove}>
                                    Remove
                                </button>
                            </div>
                            <ProgressBar style={styles.progressBarBackgroundColor} />
                        </>
                    )}
                </CSVReader>

            </>
        );


    }

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

    useEffect(() => {
        const fetchNFTAddress = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            setProviderInstance(provider)
            const signer = provider.getSigner();
            setSigner(signer)
            const contract = new ethers.Contract(
                config.contractAddress,
                DeployContractABI,
                signer
            );
            setContractInstance(contract)
        }

        fetchNFTAddress()
        setBulkMintContract(getUserContract())

    }, [address])

    const getUserContract = async () => {
        if (contractInstance) {
            const NFTContracts = await contractInstance.getContract()
            setUsersNFTContract(NFTContracts)
            if (NFTContracts.length != 0) {
                console.log(NFTContracts[NFTContracts.length - 1])
                const contract = new ethers.Contract(
                    NFTContracts[NFTContracts.length - 1],
                    NFTBulkMintABI,
                    signerObject
                )

                return (contract)
            }

        }


    }

    const deployNFTBathTransferContract = () => {
        console.log(NFTName)
        console.log(NFTSymbol)
        console.log(NFTUri)
        if (NFTName && NFTSymbol && NFTUri) {
            const trx = contractInstance.deploy(NFTName, NFTSymbol, NFTUri)
            trx.then(async (tx) => {
                console.log(tx)
                await providerInstance.waitForTransaction(tx.hash)
                await getUserContract()

            })
                .catch((error) => {
                    console.log(error)
                })

        }
    }

    const mintNFTs = async (addresses) => {
        console.log("Calliing mint nft")
        console.log(addresses)
        const contract = await getUserContract()
        console.log(contract)
        console.log(bulkMintContract)
        if (addresses && addresses.length != 0) {
            const trx = contract.mintNFTs(addresses)
            trx.then(async (tx) => {
                console.log(tx)
                await providerInstance.waitForTransaction(tx.hash)
                await getUserContract()

            })
                .catch((error) => {
                    console.log(error)
                })

        }

    }

    return (
     
        <div className="container">
            <div className="container" style={{width:"50%", padding: "2%",paddingInline: "37%"}}>
                <h1>Welcome to <span style={{color:"green"}}>NFT For All</span></h1>
            </div>
            <div className="container" style={{width:"25%", padding: "2%",paddingInline: "37%", marginTop:"-5%"}}>
                {address && address.length == 0 ? (<button style={{padding:"5%", borderRadius:"15px", borderWidth:"0px", background: "linear-gradient(to bottom, #ccffff 0%, #ffffff 100%)"}}onClick={() => {
                    connectWalletAction()
                }}>Connect Wallet</button>) : (<p>{address}</p>)}

                <br />
            </div>
            <div className="container" style={{width:"50%", padding: "2%",paddingInline: "42%", marginTop:"-6%"}}>
                <form >
                <h1 style={{marginLeft:"-5%"}}>Fill Your NFT Details</h1>
                    <div>
                        <p>Enter Your NFT Name</p>
                        <input style={{paddingBottom:"2%",paddingLeft:"15%", paddingTop:"8px", paddingRight:"-14%", borderRadius:"7px", borderWidth:"1px", background:"linear-gradient(to bottom, #ccffff 0%, #ffccff 100%)"}} type="text" onChange={(e) => { setNFTName(e.target.value); }} />
                    </div>
                    <div>
                        <p>Enter Your NFT Symbol</p>
                        <input style={{paddingBottom:"2%",paddingLeft:"15%", paddingTop:"8px", paddingRight:"-14%", borderRadius:"7px", borderWidth:"1px", background:"linear-gradient(to bottom, #ccffff 0%, #ffccff 100%)"}} type="text" onChange={(e) => { setNFTSymbol(e.target.value); }} />
                    </div>
                    <div>
                        <p>Enter Your NFT Token URI</p>
                        <input style={{paddingBottom:"2%",paddingLeft:"15%", paddingTop:"8px", paddingRight:"-14%", borderRadius:"7px", borderWidth:"1px", background:"linear-gradient(to bottom, #ccffff 0%, #ffccff 100%)"}} type="text" onChange={(e) => { setNFTUri(e.target.value); }} />
                    </div>
                    <br />
                    <div>
                        <button style={{padding:"2%", borderRadius:"12px", marginLeft:"8%", borderWidth:"0px", background: "linear-gradient(to bottom, #ccffff 0%, #ffffff 100%)"}} onClick={(e) => {
                            e.preventDefault();
                            deployNFTBathTransferContract();
                        }}>Deploy Contract</button>
                    </div>
                </form>
            </div>
            <div className="container" style={{marginTop:"-2%"}}>
                <div className="item"><h3>Upload your CSV file with addresses to bulk mint</h3></div>
                <div className="container" style={{width:"50%", marginLeft:"25%"}}><CSVInput mintNFTs={mintNFTs} addressArray={addressArray} setAddressArray={setAddressArray} /></div>

            </div>

        </div >
    )
}

export default Home