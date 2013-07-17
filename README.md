# OAGIS BPMN 2.0 Validator

This project contains a validator that takes a BPMN 2.0 XML serialization and validate that the Messages, Data Objects and Data Stores are defined in the OAGIS 9.6 namespace.

## How BPMN 2.0 Files are validated

Messages are checked against OAGIS BODs and Data Objects and Data Stores are checked against OAGIS Nouns.

A Message defined using a Noun or a Data Store/Object defined using a BOD will generate a validation error.

Validation warnings will be given for Messages, Data Stores/Objects that are undefined (not pointing to ItemDefinition) or that are not defined in the OAGIS namespace.

## What is in this repository

At the root, there is an index.html file that contains a web interface for the validation library. This web application is standalone an loads its dependencies from public Content Delivery Networks (CDN). 
This web application requires an HTML5 browser mainly because it uses the FileReader API.  The validation library used by the web application supports more browsers.

The validation library is named oagis-bpmn-validator.js and can be found under the js directory.

The test directory contains QUnit unit tests that can be run using the tests.html file. It also contains XML serialization of the test cases.

# License

The content of this repository is licensed under the **[The MIT License (MIT)](http://opensource.org/licenses/MIT)**

Copyright (c) 2013 Trisotech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.