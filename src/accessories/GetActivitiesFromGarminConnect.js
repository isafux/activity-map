// Last activity runs into an error, so limit is incremented by 1 in activityUrl
// Specify the file extension (change 'fit' below to 'fit', 'tcx', 'gpx', or 'csv' depending on which format you want to export)
const fileExtension = 'gpx';
const limit = 100;

if (localStorage.token) {
    const header = {
        'DI-Backend': 'connectapi.garmin.com',
        'Authorization': 'Bearer ' + JSON.parse(localStorage.token).access_token
    };

    let downloadCount = 0; 

    const activityUrl = `https://connect.garmin.com/activitylist-service/activities/search/activities?limit=${limit + 1}`;
    const downloadUrl = `https://connect.garmin.com/download-service/export/${fileExtension}/activity`;
    fetch(activityUrl, {'headers': header})
        .then(response => response.json())
        .then(activities => {
            let i = 0;
            activities.forEach(async a => {
                await new Promise(s => setTimeout(s, i += 4000));
                let fetchUrl = `${downloadUrl}/${a.activityId}`;
                let downloadExtension;
                if (fileExtension === 'fit') {
                    downloadExtension = 'zip'; // FIT files are downloaded as ZIP files
                } else {
                    downloadExtension = fileExtension;
                }
                const fileNameWithExtension = `${a.activityId}.${downloadExtension}`;
                fetch(fetchUrl, {'headers': header})
                .then(response => {
                        console.log(`Fetching activity ${a.activityId} started.`);                
                        if (!response.ok) {
                            throw new Error(`Request for ${fileNameWithExtension} resulted in status code ${response.status}!`);
                        }                        
                        return response.blob()
                    })
                    .then(blob => {                     
                        downloadCount++; 
                        console.log(`Downloading file ${downloadCount}: ${a.activityId}.${downloadExtension}`);
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.setAttribute('download', fileNameWithExtension); // Set the download attribute with appropriate file extension
                        link.click();
                    })
                    .catch(error => console.log('Download failed!', error));
            });
        })
        .catch(error => console.log('Fetching activities failed!', error));
} else {
    console.error('Token not found in localStorage!');
}