import { Button, Col, Form, Input, Row, TimePicker } from "antd";
import moment from "moment";
import React from "react";

function DoctorForm({ onFinish, initivalValues }) {
  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        ...initivalValues,
        ...(initivalValues && {
          timings: [
            moment(initivalValues?.timings[0], "HH:mm"),
            moment(initivalValues?.timings[1], "HH:mm"),
          ],
        }),
      }}
    >
      <h1 className="card-title mt-3">Thông tin chi tiết</h1>
      <Row gutter={20}>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Họ"
            name="firstName"
            rules={[{ required: true }]}
          >
            <Input placeholder="Họ" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Tên"
            name="lastName"
            rules={[{ required: true }]}
          >
            <Input placeholder="Tên" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ required: true }]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Website"
            name="website"
            rules={[{ required: true }]}
          >
            <Input placeholder="Website" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Địa chỉ"
            name="address"
            rules={[{ required: true }]}
          >
            <Input placeholder="Địa chỉ" />
          </Form.Item>
        </Col>
      </Row>
      <hr />
      <h1 className="card-title mt-3">Thông tin nghề nghiệp</h1>
      <Row gutter={20}>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Chuyên khoa"
            name="specialization"
            rules={[{ required: true }]}
          >
            <Input placeholder="Chuyên khoa" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Kinh nhiệm"
            name="experience"
            rules={[{ required: true }]}
          >
            <Input placeholder="Kinh nhiệm" type="number" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Giá cho một lần khám"
            name="feePerCunsultation"
            rules={[{ required: true }]}
          >
            <Input placeholder="Giá cho một lần khám" type="number" />
          </Form.Item>
        </Col>
        <Col span={8} xs={24} sm={24} lg={8}>
          <Form.Item
            required
            label="Giờ làm việc"
            name="timings"
            rules={[{ required: true }]}
          >
            <TimePicker.RangePicker format="HH:mm" />
          </Form.Item>
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <Button className="primary-button" htmlType="submit">
          Gửi
        </Button>
      </div>
    </Form>
  );
}

export default DoctorForm;
