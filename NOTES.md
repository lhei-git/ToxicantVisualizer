## Setup

API lives on ec2 instance in us-east-1. Webhook listens to curl from Github Actions and executes a basic script to update the code and run the server as a python application on port 8000. Certbot updates the ssl certificate. 

## Notes

API cert might expire on march 27th, 2023. 

Make sure vet.service is enabled and running. 

## Troubleshooting

**API not returning data**

Make sure the systemd service is enabled.

1. ssh -i <key file> ubuntu@api.vet.lhei.org
2. sudo systemctl restart vet.service

**Disk full**

[https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html)

Follow for ext4 file system