package com.techie.springai.rag;

import org.springframework.boot.SpringApplication;

import zama.learning.springai.rag.SpringAiRagTutorialApplication;

public class TestSpringAiRagTutorialApplication {

    public static void main(String[] args) {
        SpringApplication.from(SpringAiRagTutorialApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
