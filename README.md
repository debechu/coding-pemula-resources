# How to add resources.
1. Fork the repository.
2. Add files with the following format in `Resources/${CATEGORY}/file.json`:
    ```json
    // Resources/Networking/beej-networking.json
    {
        "name": "Beej's Guide to Networking",
        "languages": [
            "C"
        ],
        "url": "https://beej.us/guide/bgnet/html/index.html"
    }
    ```
    Note:
    - `languages` must be in alphabetical order.
    - `url` must be a valid url.
3. Make a pull request and you're done!
