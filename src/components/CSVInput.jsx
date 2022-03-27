import React, { useState } from "react";
import { useCSVReader } from 'react-papaparse';

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

const CSVInput = (props) => {
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
        props.setAddressArray(arrayElements)
        props.mintNFTs()
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

export default CSVInput