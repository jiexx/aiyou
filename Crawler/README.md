1.eclipse market nodeclipse 1.0.1 install
2.casperjs 1.1.0 beta5
3.nodejs v4.4.0
4.phantomjs 2.1.1

http://www.w3school.com.cn/xpath/xpath_syntax.asp
http://docs.casperjs.org/en/latest/modules/casper.html#getelementsattribute


clean install win7 sdk with .net4
https://www.microsoft.com/en-us/download/confirmation.aspx?id=15354
call "C:\Program Files\Microsoft SDKs\Windows\v7.1\bin\Setenv.cmd" /Release /x64
equationdetect.cpp--> ascii/gb2321
npm install -g node-gyp
//This example assumes you have an external library 'thelibrary', located in 
//./external/thelibrary
//With the two flavors, debug and release in lib/debug and lib/release
{
    "targets": [
        {
            "target_name": "addon",
            "sources": [
                "src/addon.cpp",
                "src/expose_the_library.cpp"
            ],
            "include_dirs": [
                "external/thelibrary/include"
            ],
			'cflags': [
				'-DHAS_EXCEPTIONS=1'
			  ],
			  'cflags_cc': [
				'-DHAS_EXCEPTIONS=1'
			  ],
            "cflags!": [
                "-fno-exceptions"
            ],
            "cflags_cc!": [
                "-fno-exceptions"
            ],
            "conditions": [
                [
                    "OS=='mac'",
                    {
                        "defines": [
                            "__MACOSX_CORE__"
                        ],
                        "architecture": "i386",
                        "xcode_settings": {
                            "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
                        },
                        "link_settings": {
                            "libraries": [
                                "-lthelibrary",
                                "-framework",   
                                "IOBluetooth" //this is how you use a framework on OSX
                            ],
                            "configurations": {
                                "Debug": {
                                    "xcode_settings": {
                                        "OTHER_LDFLAGS": [
                                            "-Lexternal/thelibrary/lib/debug"
                                        ]
                                    }
                                },
                                "Release": {
                                    "xcode_settings": {
                                        "OTHER_LDFLAGS": [
                                            "-Lexternal/thelibrary/lib/release"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ],
                [
                    "OS=='win'",
                    {
                        "link_settings": {
                            "libraries": [
                                "-lthelibrary.lib",
                            ]
                        },
                        "configurations": {
                            "Debug": {
                                "msvs_settings": {
                                    "VCCLCompilerTool": {
                                        "ExceptionHandling": "0",
                                        "AdditionalOptions": [
                                            "/MP /EHsc -D_HAS_EXCEPTIONS=1"
                                        ]
                                    },
                                    "VCLibrarianTool": {
                                        "AdditionalOptions": [
                                            "/LTCG"
                                        ]
                                    },
                                    "VCLinkerTool": {
                                        "LinkTimeCodeGeneration": 1,
                                        "LinkIncremental": 1,
                                        "AdditionalLibraryDirectories": [
                                            "../external/thelibrary/lib/debug"
                                        ]
                                    }
                                }
                            },
                            "Release": {
                                "msvs_settings": {
                                    "VCCLCompilerTool": {
                                        "RuntimeLibrary": 0,
                                        "Optimization": 3,
                                        "FavorSizeOrSpeed": 1,
                                        "InlineFunctionExpansion": 2,
                                        "WholeProgramOptimization": "true",
                                        "OmitFramePointers": "true",
                                        "EnableFunctionLevelLinking": "true",
                                        "EnableIntrinsicFunctions": "true",
                                        "RuntimeTypeInfo": "false",
                                        "ExceptionHandling": "0",
                                        "AdditionalOptions": [
                                            "/MP /EHsc -D_HAS_EXCEPTIONS=1"
                                        ]
                                    },
                                    "VCLibrarianTool": {
                                        "AdditionalOptions": [
                                            "/LTCG"
                                        ]
                                    },
                                    "VCLinkerTool": {
                                        "LinkTimeCodeGeneration": 1,
                                        "OptimizeReferences": 2,
                                        "EnableCOMDATFolding": 2,
                                        "LinkIncremental": 1,
                                        "AdditionalLibraryDirectories": [
                                            "../external/thelibrary/lib/release"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]
            ]
        }
    ]
}
http://stackoverflow.com/questions/13979860/gyp-how-to-specify-link-library-flavor
http://deadhorse.me/nodejs/2012/10/08/c_addon_in_nodejs_node_gyp.html
REFERENCE:  https://github.com/nodejs/node-gyp/wiki/Visual-Studio-2010-Setup
c++11 error: change to vc2015
dv\deps\tesseract\ccutil\platform.h(31): note: 参见“snprintf”, delete this;
npm config set msvs_version 2015 --global
tesseract\textord\cjkpitch.cpp(636): error C2668: “abs”: 对重载函数的调用不明确 vc2015+.net4.5 ok

casperjs browser.js 0 "http://www.amazon.com/Tea/b/ref=dp_bc_3?ie=UTF8&node=16318401" "redirect"

npm install body-parser
npm install multer


drop database crawler;
create database crawler char set utf8;
create table crawler.product(id varchar(512), name varchar(512), pic text, descr text, producer varchar(512), score varchar(64), review text, link varchar(512));

drop table amazon.bank;
create table amazon.bank(id varchar(64), curr varchar(512) , link varchar(512), hit int, hitPage int, hitLink int);

create table amazon.hc360(id varchar(64), title varchar(256), price varchar(128), amount varchar(128), descr text, email varchar(512), phone varchar(512), producer varchar(128), addr varchar(128), days varchar(128), link varchar(256), redirect varchar(256));

drop table amazon.abiz;
create table amazon.abiz(id varchar(64), title varchar(256), price varchar(128), amount varchar(128), descr text, email varchar(512), phone varchar(512), producer varchar(128), addr varchar(128), days varchar(128), link varchar(256), redirect varchar(256));