import sys
import os
import subprocess

dirs = {
    "symbols/device": [64],
    "legends": [80, 1280],
    "symbols/bridges": [64],
    "symbols/dec_repeater": [64],
}


if __name__ == '__main__':
    src = sys.argv[1]
    dst = sys.argv[2]
    problems = []
    for d in dirs:
        path = os.path.join(src, d)
        dest = os.path.join(dst, d)
        try:
            os.makedirs(dest)
        except OSError:
            pass
        for size in dirs[d]:
            for f in os.listdir(path):
                print path
                source = os.path.join(path, f)
                shortname, ext = os.path.splitext(f)
                ext = ext.lower()
                destination = os.path.join(dest, shortname)
                if ext == ".svg":
                    destination += "_{0}.png".format(size)
                    if not os.path.exists(destination):
                        subprocess.call("inkscape {source} --export-png={destination} -w{size}".format(**locals()), shell=True)
                elif ext in [".png", ".jpg"]:
                    destination += "_{0}{1}".format(size, ext)
                    if not os.path.exists(destination):
                        #subprocess.call("convert -resize {size}\> {source} {destination}".format(**locals()), shell=True)
                        try:
                            subprocess.check_call("convert -resize {size}\> {source} {destination}".format(**locals()), shell=True)
                        except subprocess.CalledProcessError, e:
                            problems.append(e)
    if problems:
        print('Build problems were encountered:')
        for p in problems:
            print(p)
