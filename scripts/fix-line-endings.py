import os

# Convert CRLF to LF in all .clar files
contracts_dir = "contracts"

for filename in os.listdir(contracts_dir):
    if filename.endswith(".clar"):
        filepath = os.path.join(contracts_dir, filename)
        print(f"Converting {filename}...")
        
        with open(filepath, 'rb') as f:
            content = f.read()
        
        # Replace CRLF with LF
        content = content.replace(b'\r\n', b'\n')
        
        with open(filepath, 'wb') as f:
            f.write(content)
        
        print(f"OK: {filename} converted")

print("\nAll contract files converted to LF line endings!")
